export type DocxImportDiagnostic = {
  code: string
  message: string
}

export type DocxImportResult = {
  manuscript: string
  diagnostics: DocxImportDiagnostic[]
}

type ZipEntry = {
  name: string
  compressionMethod: number
  compressedSize: number
  localHeaderOffset: number
}

type ParsedParagraph = {
  kind: 'paragraph'
  text: string
  headingLevel?: 1 | 2 | 3
  isTitle?: boolean
  pageBreakBefore?: 'preferred' | 'forced'
}

type ParsedTable = {
  kind: 'table'
  rows: string[][]
  pageBreakBefore?: 'preferred' | 'forced'
}

type ParsedBodyItem = ParsedParagraph | ParsedTable

type TableRendering = {
  lines: string[]
  diagnostic: DocxImportDiagnostic
}

const WORDPROCESSING_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50
const LOCAL_FILE_SIGNATURE = 0x04034b50
const MAX_EOCD_SEARCH_BYTES = 65557
const AUTHOR_ONLY_MARKERS = new Set(['PRODUCT / LAYOUT NOTE', 'INTERNAL DRAFT NOTE'])

function readUint16(view: DataView, offset: number): number {
  return view.getUint16(offset, true)
}

function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, true)
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumOffset = Math.max(0, view.byteLength - MAX_EOCD_SEARCH_BYTES)

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (readUint32(view, offset) === EOCD_SIGNATURE) {
      return offset
    }
  }

  throw new Error('This file is not a readable DOCX archive.')
}

function readZipEntries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const eocdOffset = findEndOfCentralDirectory(view)
  const entryCount = readUint16(view, eocdOffset + 10)
  let offset = readUint32(view, eocdOffset + 16)
  const decoder = new TextDecoder('utf-8')
  const entries: ZipEntry[] = []

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint32(view, offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error('The DOCX archive directory is malformed.')
    }

    const compressionMethod = readUint16(view, offset + 10)
    const compressedSize = readUint32(view, offset + 20)
    const fileNameLength = readUint16(view, offset + 28)
    const extraLength = readUint16(view, offset + 30)
    const commentLength = readUint16(view, offset + 32)
    const localHeaderOffset = readUint32(view, offset + 42)
    const fileNameStart = offset + 46
    const fileName = decoder.decode(bytes.slice(fileNameStart, fileNameStart + fileNameLength))

    entries.push({
      name: fileName,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    })

    offset = fileNameStart + fileNameLength + extraLength + commentLength
  }

  return entries
}

async function decompressDeflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof globalThis.DecompressionStream !== 'function') {
    throw new Error('This browser cannot decompress DOCX files locally.')
  }

  const ownedBuffer = new ArrayBuffer(compressed.byteLength)
  new Uint8Array(ownedBuffer).set(compressed)
  const stream = new Blob([ownedBuffer]).stream().pipeThrough(
    new DecompressionStream('deflate-raw'),
  )
  const buffer = await new Response(stream).arrayBuffer()
  return new Uint8Array(buffer)
}

async function readZipEntry(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const offset = entry.localHeaderOffset

  if (readUint32(view, offset) !== LOCAL_FILE_SIGNATURE) {
    throw new Error(`The DOCX entry ${entry.name} has a malformed local header.`)
  }

  const fileNameLength = readUint16(view, offset + 26)
  const extraLength = readUint16(view, offset + 28)
  const dataStart = offset + 30 + fileNameLength + extraLength
  const compressed = bytes.slice(dataStart, dataStart + entry.compressedSize)

  if (entry.compressionMethod === 0) {
    return compressed
  }

  if (entry.compressionMethod === 8) {
    return decompressDeflateRaw(compressed)
  }

  throw new Error(`Unsupported DOCX compression method: ${entry.compressionMethod}.`)
}

function wordElements(element: Element, localName: string): Element[] {
  return Array.from(element.getElementsByTagNameNS(WORDPROCESSING_NAMESPACE, localName))
}

function wordAttribute(element: Element | undefined, localName: string): string | undefined {
  if (!element) return undefined

  return (
    element.getAttributeNS(WORDPROCESSING_NAMESPACE, localName) ??
    element.getAttribute(`w:${localName}`) ??
    element.getAttribute(localName) ??
    undefined
  )
}

function paragraphText(paragraph: Element): string {
  return wordElements(paragraph, 't')
    .map((node) => node.textContent ?? '')
    .join('')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function normalizedStyleId(paragraph: Element): string {
  const style = wordElements(paragraph, 'pStyle')[0]
  return (wordAttribute(style, 'val') ?? '').toLowerCase().replace(/[\s_-]/g, '')
}

function headingLevelFromStyle(styleId: string): 1 | 2 | 3 | undefined {
  if (/^(heading|head)1$/.test(styleId)) return 1
  if (/^(heading|head)2$/.test(styleId)) return 2
  if (/^(heading|head)3$/.test(styleId) || styleId === 'journalprompt') return 3
  return undefined
}

function paragraphPageBreak(paragraph: Element): 'preferred' | 'forced' | undefined {
  if (wordElements(paragraph, 'pageBreakBefore').length > 0) {
    return 'preferred'
  }

  const hasManualPageBreak = wordElements(paragraph, 'br').some(
    (breakElement) => wordAttribute(breakElement, 'type')?.toLowerCase() === 'page',
  )

  return hasManualPageBreak ? 'forced' : undefined
}

function parseParagraph(paragraph: Element): ParsedParagraph | undefined {
  const text = paragraphText(paragraph)
  const pageBreakBefore = paragraphPageBreak(paragraph)

  if (!text && !pageBreakBefore) {
    return undefined
  }

  const styleId = normalizedStyleId(paragraph)

  return {
    kind: 'paragraph',
    text,
    headingLevel: headingLevelFromStyle(styleId),
    isTitle: styleId === 'title',
    pageBreakBefore,
  }
}

function parseTable(table: Element): ParsedTable | undefined {
  const rows = Array.from(table.children)
    .filter((child) => child.localName === 'tr')
    .map((row) =>
      Array.from(row.children)
        .filter((child) => child.localName === 'tc')
        .map((cell) =>
          wordElements(cell, 'p')
            .map((paragraph) => paragraphText(paragraph))
            .filter(Boolean)
            .join(' '),
        ),
    )
    .filter((row) => row.some((cell) => cell.length > 0))

  if (rows.length === 0) return undefined

  return {
    kind: 'table',
    rows,
  }
}

function parseDocumentBody(xml: string): ParsedBodyItem[] {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = document.querySelector('parsererror')

  if (parserError) {
    throw new Error('The Word document XML could not be parsed.')
  }

  const body = wordElements(document.documentElement, 'body')[0]
  if (!body) {
    throw new Error('The DOCX file does not contain a Word document body.')
  }

  const items: ParsedBodyItem[] = []
  let pendingBreak: 'preferred' | 'forced' | undefined

  for (const child of Array.from(body.children)) {
    if (child.localName === 'p') {
      const paragraph = parseParagraph(child)
      if (!paragraph) continue

      if (!paragraph.text && paragraph.pageBreakBefore) {
        pendingBreak = paragraph.pageBreakBefore
        continue
      }

      if (pendingBreak && !paragraph.pageBreakBefore) {
        paragraph.pageBreakBefore = pendingBreak
        pendingBreak = undefined
      }

      items.push(paragraph)
      continue
    }

    if (child.localName === 'tbl') {
      const table = parseTable(child)
      if (!table) continue

      if (pendingBreak) {
        table.pageBreakBefore = pendingBreak
        pendingBreak = undefined
      }

      items.push(table)
    }
  }

  return items
}

function isWritingLine(text: string): boolean {
  const normalized = text.replace(/\s+/g, '')
  return /^_{4,}$/.test(normalized) || /^\.{6,}$/.test(normalized)
}

function checkboxTexts(text: string): string[] {
  const normalized = text.trim()
  if (!/^(?:☐|□|\[\s?\])/.test(normalized)) return []

  return normalized
    .split(/(?:☐|□|\[\s?\])\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

function renderMarkdownTable(table: ParsedTable): string[] {
  const width = Math.max(...table.rows.map((row) => row.length))
  const normalizedRows = table.rows.map((row) =>
    Array.from({ length: width }, (_, index) => escapeMarkdownCell(row[index] ?? '')),
  )
  const header = normalizedRows[0] ?? []
  const separator = header.map(() => '---')

  return [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...normalizedRows.slice(1).map((row) => `| ${row.join(' | ')} |`),
  ]
}

function renderCheckboxTable(table: ParsedTable): TableRendering | undefined {
  const cells = table.rows.flat().map((cell) => cell.trim()).filter(Boolean)
  if (cells.length === 0) return undefined

  const groups = cells.map((cell) => checkboxTexts(cell))
  if (groups.some((group) => group.length === 0)) return undefined

  return {
    lines: groups.flat().flatMap((label) => [`- [ ] ${label}`, '']),
    diagnostic: {
      code: 'checkbox-table-normalized',
      message: 'A Word checkbox grid was normalized into editable Gentle Page checkboxes.',
    },
  }
}

function renderResponseGrid(table: ParsedTable): TableRendering | undefined {
  const pairs: Array<{ label: string; size: 'short' | 'medium' | 'long' }> = []

  for (const row of table.rows) {
    if (row.length < 2 || row.length % 2 !== 0) return undefined

    for (let index = 0; index < row.length; index += 2) {
      const label = row[index]?.trim() ?? ''
      const writingSpace = row[index + 1]?.trim() ?? ''
      if (!label || !isWritingLine(writingSpace)) return undefined

      const underscoreCount = writingSpace.replace(/[^_.]/g, '').length
      pairs.push({
        label,
        size: underscoreCount >= 80 ? 'medium' : 'short',
      })
    }
  }

  if (pairs.length === 0) return undefined

  return {
    lines: pairs.flatMap(({ label, size }) => [
      `### ${label}`,
      '',
      `[[GP:RESPONSE size="${size}"]]`,
      '',
    ]),
    diagnostic: {
      code: 'response-grid-normalized',
      message: 'A Word label-and-writing-space grid was normalized into response fields.',
    },
  }
}

function renderTable(table: ParsedTable): TableRendering {
  return (
    renderCheckboxTable(table) ??
    renderResponseGrid(table) ?? {
      lines: renderMarkdownTable(table),
      diagnostic: {
        code: 'table-preserved-as-markdown',
        message: 'A Word table was preserved as structured Markdown for compilation.',
      },
    }
  )
}

function renderPageBreak(intent: 'preferred' | 'forced'): string {
  return `[[GP:PAGE_BREAK type="${intent}"]]`
}

function isAuthorOnlyMarker(item: ParsedBodyItem): boolean {
  return item.kind === 'paragraph' && AUTHOR_ONLY_MARKERS.has(item.text.trim().toUpperCase())
}

function skipAuthorOnlySection(items: ParsedBodyItem[], startIndex: number): number {
  let cursor = startIndex + 1

  while (cursor < items.length) {
    const candidate = items[cursor]
    if (!candidate) break

    if (candidate.pageBreakBefore) break
    if (candidate.kind === 'paragraph' && candidate.headingLevel === 1) break
    cursor += 1
  }

  return cursor
}

function renderItemsAsManuscript(items: ParsedBodyItem[], fallbackTitle: string): DocxImportResult {
  const output: string[] = []
  const diagnostics: DocxImportDiagnostic[] = []
  let title = ''
  let index = 0

  while (index < items.length) {
    const item = items[index]
    if (!item) break

    if (isAuthorOnlyMarker(item)) {
      diagnostics.push({
        code: 'author-only-section-removed',
        message: `${item.text} was kept out of publication output.`,
      })
      index = skipAuthorOnlySection(items, index)
      continue
    }

    if (item.kind === 'paragraph' && isWritingLine(item.text)) {
      let count = 1
      let cursor = index + 1

      while (
        cursor < items.length &&
        items[cursor]?.kind === 'paragraph' &&
        isWritingLine((items[cursor] as ParsedParagraph).text)
      ) {
        count += 1
        cursor += 1
      }

      if (item.pageBreakBefore) output.push(renderPageBreak(item.pageBreakBefore), '')
      const size = count === 1 ? 'short' : count === 2 ? 'medium' : 'long'
      output.push(`[[GP:RESPONSE size="${size}"]]`, '')
      index = cursor
      continue
    }

    if (item.pageBreakBefore) {
      output.push(renderPageBreak(item.pageBreakBefore), '')
    }

    if (item.kind === 'table') {
      const rendered = renderTable(item)
      output.push(...rendered.lines, '')
      diagnostics.push(rendered.diagnostic)
      index += 1
      continue
    }

    const checkboxes = checkboxTexts(item.text)
    if (checkboxes.length > 0) {
      output.push(...checkboxes.flatMap((label) => [`- [ ] ${label}`, '']))
      index += 1
      continue
    }

    if (item.isTitle && item.text && !title) {
      title = item.text
      output.push(`# ${item.text}`, '')
      index += 1
      continue
    }

    if (item.headingLevel && item.text) {
      if (!title && item.headingLevel === 1 && output.length === 0) {
        title = item.text
        output.push(`# ${item.text}`, '')
      } else {
        output.push(`${'#'.repeat(Math.min(item.headingLevel + 1, 3))} ${item.text}`, '')
      }
      index += 1
      continue
    }

    const nextItem = items[index + 1]
    if (
      item.text &&
      nextItem?.kind === 'paragraph' &&
      isWritingLine(nextItem.text)
    ) {
      output.push(`### ${item.text}`, '')
      index += 1
      continue
    }

    if (item.text) {
      output.push(item.text, '')
    }

    index += 1
  }

  if (!title) {
    output.unshift(`# ${fallbackTitle}`, '')
  }

  return {
    manuscript: output.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    diagnostics,
  }
}

function fallbackTitleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.docx$/i, '').trim()
  return withoutExtension || 'Untitled publication'
}

export async function importDocxManuscript(
  buffer: ArrayBuffer,
  fileName = 'Untitled publication.docx',
): Promise<DocxImportResult> {
  const bytes = new Uint8Array(buffer)
  const entries = readZipEntries(bytes)
  const documentEntry = entries.find((entry) => entry.name === 'word/document.xml')

  if (!documentEntry) {
    throw new Error('The DOCX file is missing word/document.xml.')
  }

  const documentBytes = await readZipEntry(bytes, documentEntry)
  const xml = new TextDecoder('utf-8').decode(documentBytes)
  const items = parseDocumentBody(xml)

  if (items.length === 0) {
    throw new Error('No publication content was found in this DOCX file.')
  }

  return renderItemsAsManuscript(items, fallbackTitleFromFileName(fileName))
}
