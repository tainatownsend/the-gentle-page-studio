import { describe, expect, it } from 'vitest'

import {
  docxArrayBufferToManuscript,
  docxDocumentXmlToManuscript,
  GentlePageDocxError,
} from './docxToGentlePageManuscript'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const encoder = new TextEncoder()

function documentXml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${WORD_NS}"><w:body>${body}</w:body></w:document>`
}

function createStoredZipEntry(name: string, content: string): ArrayBuffer {
  const nameBytes = encoder.encode(name)
  const contentBytes = encoder.encode(content)
  const localHeaderLength = 30 + nameBytes.length
  const centralHeaderLength = 46 + nameBytes.length
  const totalLength = localHeaderLength + contentBytes.length + centralHeaderLength + 22
  const bytes = new Uint8Array(totalLength)
  const view = new DataView(bytes.buffer)
  let offset = 0

  view.setUint32(offset, 0x04034b50, true)
  view.setUint16(offset + 4, 20, true)
  view.setUint16(offset + 6, 0, true)
  view.setUint16(offset + 8, 0, true)
  view.setUint32(offset + 18, contentBytes.length, true)
  view.setUint32(offset + 22, contentBytes.length, true)
  view.setUint16(offset + 26, nameBytes.length, true)
  view.setUint16(offset + 28, 0, true)
  bytes.set(nameBytes, offset + 30)
  bytes.set(contentBytes, localHeaderLength)

  const centralOffset = localHeaderLength + contentBytes.length
  offset = centralOffset
  view.setUint32(offset, 0x02014b50, true)
  view.setUint16(offset + 4, 20, true)
  view.setUint16(offset + 6, 20, true)
  view.setUint16(offset + 8, 0, true)
  view.setUint16(offset + 10, 0, true)
  view.setUint32(offset + 20, contentBytes.length, true)
  view.setUint32(offset + 24, contentBytes.length, true)
  view.setUint16(offset + 28, nameBytes.length, true)
  view.setUint16(offset + 30, 0, true)
  view.setUint16(offset + 32, 0, true)
  view.setUint16(offset + 34, 0, true)
  view.setUint16(offset + 36, 0, true)
  view.setUint32(offset + 38, 0, true)
  view.setUint32(offset + 42, 0, true)
  bytes.set(nameBytes, offset + 46)

  const endOffset = centralOffset + centralHeaderLength
  view.setUint32(endOffset, 0x06054b50, true)
  view.setUint16(endOffset + 4, 0, true)
  view.setUint16(endOffset + 6, 0, true)
  view.setUint16(endOffset + 8, 1, true)
  view.setUint16(endOffset + 10, 1, true)
  view.setUint32(endOffset + 12, centralHeaderLength, true)
  view.setUint32(endOffset + 16, centralOffset, true)
  view.setUint16(endOffset + 20, 0, true)

  return bytes.buffer
}

describe('docxDocumentXmlToManuscript', () => {
  it('preserves paragraph order, heading styles, and page-break-before intent', () => {
    const manuscript = docxDocumentXmlToManuscript(
      documentXml(`
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Burnout Recovery Journal</w:t></w:r></w:p>
<w:p><w:r><w:t>A capacity-first workbook.</w:t></w:r></w:p>
<w:p><w:pPr><w:pageBreakBefore/><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Phase 1</w:t></w:r></w:p>
<w:p><w:r><w:t>Reduce immediate strain.</w:t></w:r></w:p>`),
    )

    expect(manuscript).toBe(`# Burnout Recovery Journal

A capacity-first workbook.

[[GP:PAGE_BREAK type="preferred"]]
## Phase 1

Reduce immediate strain.`)
  })

  it('preserves Word tables as Markdown table structure instead of flattening cells', () => {
    const manuscript = docxDocumentXmlToManuscript(
      documentXml(`
<w:tbl>
  <w:tr><w:tc><w:p><w:r><w:t>Area</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Capacity</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:t>Physical</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Low</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>`),
    )

    expect(manuscript).toBe(`| Area | Capacity |
| --- | --- |
| Physical | Low |`)
  })

  it('turns explicit Word page breaks into forced Gentle Page page intent', () => {
    const manuscript = docxDocumentXmlToManuscript(
      documentXml(`<w:p><w:r><w:br w:type="page"/><w:t>Next page</w:t></w:r></w:p>`),
    )

    expect(manuscript).toBe(`[[GP:PAGE_BREAK type="forced"]]
Next page`)
  })

  it('extracts word/document.xml from a DOCX ZIP archive', async () => {
    const xml = documentXml(
      `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Energy Audit</w:t></w:r></w:p>`,
    )
    const buffer = createStoredZipEntry('word/document.xml', xml)

    await expect(docxArrayBufferToManuscript(buffer)).resolves.toBe('# Energy Audit')
  })

  it('rejects malformed Word XML', () => {
    expect(() => docxDocumentXmlToManuscript('<not-closed>')).toThrow(GentlePageDocxError)
  })
})
