const ZIP_LOCAL_FILE_SIGNATURE = 0x04034b50
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50
const ZIP_END_OF_CENTRAL_DIRECTORY_MIN_SIZE = 22
const ZIP_MAX_COMMENT_SIZE = 0xffff

export class DocxZipError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocxZipError'
  }
}

type ZipEntry = {
  name: string
  compressionMethod: number
  flags: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
}

function assertRange(bytes: Uint8Array, offset: number, length: number, label: string) {
  if (offset < 0 || length < 0 || offset + length > bytes.byteLength) {
    throw new DocxZipError(`The Word document has an invalid ${label}.`)
  }
}

function readUint16(view: DataView, offset: number): number {
  if (offset < 0 || offset + 2 > view.byteLength) {
    throw new DocxZipError('The Word document contains a truncated ZIP record.')
  }

  return view.getUint16(offset, true)
}

function readUint32(view: DataView, offset: number): number {
  if (offset < 0 || offset + 4 > view.byteLength) {
    throw new DocxZipError('The Word document contains a truncated ZIP record.')
  }

  return view.getUint32(offset, true)
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumOffset = Math.max(
    0,
    view.byteLength - ZIP_END_OF_CENTRAL_DIRECTORY_MIN_SIZE - ZIP_MAX_COMMENT_SIZE,
  )

  for (
    let offset = view.byteLength - ZIP_END_OF_CENTRAL_DIRECTORY_MIN_SIZE;
    offset >= minimumOffset;
    offset -= 1
  ) {
    if (readUint32(view, offset) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset
    }
  }

  throw new DocxZipError('This file is not a readable .docx package.')
}

function decodeEntryName(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes)
}

function readCentralDirectory(bytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const endOffset = findEndOfCentralDirectory(view)
  const totalEntries = readUint16(view, endOffset + 10)
  const centralDirectorySize = readUint32(view, endOffset + 12)
  const centralDirectoryOffset = readUint32(view, endOffset + 16)

  assertRange(bytes, centralDirectoryOffset, centralDirectorySize, 'central directory')

  const entries = new Map<string, ZipEntry>()
  let offset = centralDirectoryOffset

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUint32(view, offset) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
      throw new DocxZipError('The Word document has an invalid central directory entry.')
    }

    const flags = readUint16(view, offset + 8)
    const compressionMethod = readUint16(view, offset + 10)
    const compressedSize = readUint32(view, offset + 20)
    const uncompressedSize = readUint32(view, offset + 24)
    const fileNameLength = readUint16(view, offset + 28)
    const extraLength = readUint16(view, offset + 30)
    const commentLength = readUint16(view, offset + 32)
    const localHeaderOffset = readUint32(view, offset + 42)
    const fileNameOffset = offset + 46

    assertRange(bytes, fileNameOffset, fileNameLength, 'entry filename')

    const name = decodeEntryName(bytes.subarray(fileNameOffset, fileNameOffset + fileNameLength))

    entries.set(name, {
      name,
      compressionMethod,
      flags,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    })

    offset = fileNameOffset + fileNameLength + extraLength + commentLength
  }

  return entries
}

async function inflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof globalThis.DecompressionStream !== 'function') {
    throw new DocxZipError(
      'This browser cannot decompress Word documents. Use a current version of Chrome, Edge, Safari, or Firefox.',
    )
  }

  const source = compressed.buffer.slice(
    compressed.byteOffset,
    compressed.byteOffset + compressed.byteLength,
  ) as ArrayBuffer
  const stream = new Blob([source])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
  const inflated = await new Response(stream).arrayBuffer()

  return new Uint8Array(inflated)
}

async function readEntryBytes(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  if ((entry.flags & 0x0001) !== 0) {
    throw new DocxZipError('Password-protected Word documents are not supported.')
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const localOffset = entry.localHeaderOffset

  if (readUint32(view, localOffset) !== ZIP_LOCAL_FILE_SIGNATURE) {
    throw new DocxZipError(`The Word document has an invalid local entry for ${entry.name}.`)
  }

  const fileNameLength = readUint16(view, localOffset + 26)
  const extraLength = readUint16(view, localOffset + 28)
  const dataOffset = localOffset + 30 + fileNameLength + extraLength

  assertRange(bytes, dataOffset, entry.compressedSize, `content entry ${entry.name}`)

  const compressed = bytes.subarray(dataOffset, dataOffset + entry.compressedSize)

  if (entry.compressionMethod === 0) {
    return new Uint8Array(compressed)
  }

  if (entry.compressionMethod === 8) {
    const inflated = await inflateRaw(compressed)

    if (entry.uncompressedSize > 0 && inflated.byteLength !== entry.uncompressedSize) {
      throw new DocxZipError(`The Word document entry ${entry.name} did not decompress safely.`)
    }

    return inflated
  }

  throw new DocxZipError(
    `The Word document uses unsupported ZIP compression method ${entry.compressionMethod}.`,
  )
}

export async function readDocxTextEntries(
  input: ArrayBuffer,
  entryNames: readonly string[],
): Promise<Map<string, string>> {
  const bytes = new Uint8Array(input)
  const entries = readCentralDirectory(bytes)
  const output = new Map<string, string>()
  const decoder = new TextDecoder('utf-8')

  for (const entryName of entryNames) {
    const entry = entries.get(entryName)

    if (!entry) continue

    const entryBytes = await readEntryBytes(bytes, entry)
    output.set(entryName, decoder.decode(entryBytes))
  }

  return output
}
