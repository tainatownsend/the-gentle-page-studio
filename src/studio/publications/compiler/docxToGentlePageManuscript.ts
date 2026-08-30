const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50
const UTF8 = new TextDecoder('utf-8')

export class GentlePageDocxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GentlePageDocxError'
  }
}

type ZipEntry = {
  name: string
  compressionMethod: number
  compressedSize: number
  localHeaderOffset: number
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumOffset = Math.max(0, view.byteLength - 65_557)

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset
    }
  }

  throw new GentlePageDocxError('This file is not a readable DOCX archive.')
}

function readZipEntries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const endOffset = findEndOfCentralDirectory(view)
  const entryCount = view.getUint16(endOffset + 10, true)
  const centralDirectoryOffset = view.getUint32(endOffset + 16, true)
  const entries: ZipEntry[] = []
  let offset = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
      throw new GentlePageDocxError('The DOCX archive directory is malformed.')
    }

    const compressionMethod = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const fileNameLength = view.getUint16(offset + 28, true)
    const extraFieldLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localHeaderOffset = view.getUint32(offset + 42, true)
    const fileNameStart = offset + 46
    const name = UTF8.decode(bytes.subarray(fileNameStart, fileNameStart + fileNameLength))

    entries.push({
      name,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    })

    offset = fileNameStart + fileNameLength + extraFieldLength + commentLength
  }

  return entries
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new GentlePageDocxError(
      'This browser cannot decompress DOCX files. Paste the manuscript instead.',
    )
  }

  const payload = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(payload).set(bytes)
  const stream = new Blob([payload]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZipEntry(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const offset = entry.localHeaderOffset

  if (view.getUint32(offset, true) !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
    throw new GentlePageDocxError(`The DOCX entry ${entry.name} has an invalid local header.`)
  }

  const fileNameLength = view.getUint16(offset + 26, true)
  const extraFieldLength = view.getUint16(offset + 28, true)
  const dataStart = offset + 30 + fileNameLength + extraFieldLength
  const compressed = bytes.subarray(dataStart, dataStart + entry.compressedSize)

  if (entry.compressionMethod === 0) {
    return compressed
  }

  if (entry.compressionMethod === 8) {
    return inflateRaw(compressed)
  }

  throw new GentlePageDocxError(
    `This DOCX uses an unsupported ZIP compression method (${entry.compressionMethod}).`,
  )
}

function descendantsByLocalName(element: Element, localName: string): Element[] {
  return Array.from(element.getElementsByTagNameNS('*', localName))
}

function firstDescendantByLocalName(element: Element, localName: string): Element | undefined {
  return descendantsByLocalName(element, localName)[0]
}

function getWordAttribute(element: Element | undefined, localName: string): string | undefined {
  if (!element) return undefined

  return (
    element.getAttributeNS(
      'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      localName,
    ) ??
    element.getAttribute(`w:${localName}`) ??
    element.getAttribute(localName) ??
    undefined
  )
}

function getParagraphText(paragraph: Element): string {
  return descendantsByLocalName(paragraph, 't')
    .map((node) => node.textContent ?? '')
    .join('')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function getParagraphStyle(paragraph: Element): string | undefined {
  return getWordAttribute(firstDescendantByLocalName(paragraph, 'pStyle'), 'val')
}

function hasPageBreakBefore(paragraph: Element): boolean {
  return firstDescendantByLocalName(paragraph, 'pageBreakBefore') !== undefined
}

function hasExplicitPageBreak(paragraph: Element): boolean {
  return descendantsByLocalName(paragraph, 'br').some(
    (element) => getWordAttribute(element, 'type') === 'page',
  )
}

function headingPrefix(style: string | undefined): string | undefined {
  const normalized = style?.replace(/\s+/g, '').toLowerCase()

  if (normalized === 'heading1' || normalized === 'title') return '#'
  if (normalized === 'heading2') return '##'
  if (normalized === 'heading3') return '###'
  return undefined
}

function paragraphToManuscript(paragraph: Element): string[] {
  const text = getParagraphText(paragraph)
  const lines: string[] = []

  if (hasPageBreakBefore(paragraph)) {
    lines.push('[[GP:PAGE_BREAK type="preferred"]]')
  }

  if (hasExplicitPageBreak(paragraph)) {
    lines.push('[[GP:PAGE_BREAK type="forced"]]')
  }

  if (!text) {
    return lines
  }

  const prefix = headingPrefix(getParagraphStyle(paragraph))
  lines.push(prefix ? `${prefix} ${text}` : text)
  return lines
}

function tableToManuscript(table: Element): string[] {
  const rows = descendantsByLocalName(table, 'tr').map((row) =>
    descendantsByLocalName(row, 'tc').map((cell) => {
      const text = descendantsByLocalName(cell, 'p')
        .map((paragraph) => getParagraphText(paragraph))
        .filter(Boolean)
        .join(' / ')

      return text.replace(/\|/g, '\\|')
    }),
  )

  if (rows.length === 0) return []

  const width = Math.max(...rows.map((row) => row.length))
  const normalizedRows = rows.map((row) => [
    ...row,
    ...Array.from({ length: Math.max(0, width - row.length) }, () => ''),
  ])
  const firstRow = normalizedRows[0] ?? []
  const lines = [
    `| ${firstRow.join(' | ')} |`,
    `| ${Array.from({ length: width }, () => '---').join(' | ')} |`,
    ...normalizedRows.slice(1).map((row) => `| ${row.join(' | ')} |`),
  ]

  return lines
}

export function docxDocumentXmlToManuscript(xml: string): string {
  const parser = new DOMParser()
  const document = parser.parseFromString(xml, 'application/xml')

  if (document.querySelector('parsererror')) {
    throw new GentlePageDocxError('The Word document XML could not be parsed.')
  }

  const body = Array.from(document.getElementsByTagNameNS('*', 'body'))[0]

  if (!body) {
    throw new GentlePageDocxError('The Word document does not contain a document body.')
  }

  const output: string[] = []

  Array.from(body.children).forEach((child) => {
    let blockLines: string[] = []

    if (child.localName === 'p') {
      blockLines = paragraphToManuscript(child)
    } else if (child.localName === 'tbl') {
      blockLines = tableToManuscript(child)
    }

    if (blockLines.length > 0) {
      output.push(blockLines.join('\n'))
    }
  })

  return output.join('\n\n').trim()
}

export async function docxArrayBufferToManuscript(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  const entry = readZipEntries(bytes).find((candidate) => candidate.name === 'word/document.xml')

  if (!entry) {
    throw new GentlePageDocxError('This DOCX does not contain word/document.xml.')
  }

  const xml = UTF8.decode(await readZipEntry(bytes, entry))
  return docxDocumentXmlToManuscript(xml)
}

export async function docxBlobToManuscript(blob: Blob): Promise<string> {
  return docxArrayBufferToManuscript(await blob.arrayBuffer())
}
