import { describe, expect, it } from 'vitest'

import { importDocxManuscript } from './importDocxManuscript'

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function pushUint32(target: number[], value: number) {
  target.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  )
}

function createStoredZip(entries: Array<{ name: string; content: string }>): ArrayBuffer {
  const encoder = new TextEncoder()
  const output: number[] = []
  const centralRecords: number[][] = []

  for (const entry of entries) {
    const name = Array.from(encoder.encode(entry.name))
    const content = Array.from(encoder.encode(entry.content))
    const localHeaderOffset = output.length

    pushUint32(output, 0x04034b50)
    pushUint16(output, 20)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint32(output, 0)
    pushUint32(output, content.length)
    pushUint32(output, content.length)
    pushUint16(output, name.length)
    pushUint16(output, 0)
    output.push(...name, ...content)

    const central: number[] = []
    pushUint32(central, 0x02014b50)
    pushUint16(central, 20)
    pushUint16(central, 20)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint32(central, 0)
    pushUint32(central, content.length)
    pushUint32(central, content.length)
    pushUint16(central, name.length)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint32(central, 0)
    pushUint32(central, localHeaderOffset)
    central.push(...name)
    centralRecords.push(central)
  }

  const centralOffset = output.length
  centralRecords.forEach((record) => output.push(...record))
  const centralSize = output.length - centralOffset

  pushUint32(output, 0x06054b50)
  pushUint16(output, 0)
  pushUint16(output, 0)
  pushUint16(output, entries.length)
  pushUint16(output, entries.length)
  pushUint32(output, centralSize)
  pushUint32(output, centralOffset)
  pushUint16(output, 0)

  return new Uint8Array(output).buffer
}

const DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Burnout Recovery Journal</w:t></w:r></w:p>
    <w:p><w:r><w:t>A gentle introduction.</w:t></w:r></w:p>
    <w:p><w:pPr><w:pageBreakBefore/></w:pPr><w:r><w:t>Phase One</w:t></w:r><w:pPr><w:pStyle w:val="Heading1"/></w:pPr></w:p>
    <w:p><w:r><w:t>What would support you today?</w:t></w:r></w:p>
    <w:p><w:r><w:t>________________________</w:t></w:r></w:p>
    <w:p><w:r><w:t>________________________</w:t></w:r></w:p>
    <w:p><w:r><w:t>________________________</w:t></w:r></w:p>
    <w:p><w:r><w:t>☐ Protect a break</w:t></w:r></w:p>
    <w:tbl>
      <w:tr><w:tc><w:p><w:r><w:t>Area</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Capacity</w:t></w:r></w:p></w:tc></w:tr>
      <w:tr><w:tc><w:p><w:r><w:t>Physical</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Low</w:t></w:r></w:p></w:tc></w:tr>
    </w:tbl>
  </w:body>
</w:document>`

describe('importDocxManuscript', () => {
  it('converts Word structure into a Gentle Page manuscript without external dependencies', async () => {
    const result = await importDocxManuscript(
      createStoredZip([{ name: 'word/document.xml', content: DOCUMENT_XML }]),
      'draft.docx',
    )

    expect(result.manuscript).toContain('# Burnout Recovery Journal')
    expect(result.manuscript).toContain('[[GP:PAGE_BREAK type="preferred"]]')
    expect(result.manuscript).toContain('## Phase One')
    expect(result.manuscript).toContain('What would support you today?')
    expect(result.manuscript).toContain('[[GP:RESPONSE size="long"]]')
    expect(result.manuscript).toContain('- [ ] Protect a break')
    expect(result.manuscript).toContain('| Area | Capacity |')
    expect(result.manuscript).toContain('| Physical | Low |')
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: 'table-preserved-as-markdown' }),
    ])
  })

  it('uses the file name when the document has no explicit title style', async () => {
    const xml = DOCUMENT_XML.replace(
      '<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Burnout Recovery Journal</w:t></w:r></w:p>',
      '<w:p><w:r><w:t>Opening paragraph</w:t></w:r></w:p>',
    )

    const result = await importDocxManuscript(
      createStoredZip([{ name: 'word/document.xml', content: xml }]),
      '30-Day Energy Audit.docx',
    )

    expect(result.manuscript.startsWith('# 30-Day Energy Audit')).toBe(true)
  })

  it('rejects archives that are not Word documents', async () => {
    await expect(
      importDocxManuscript(
        createStoredZip([{ name: 'notes.txt', content: 'not a docx' }]),
        'notes.docx',
      ),
    ).rejects.toThrow('word/document.xml')
  })
})
