import { describe, expect, it } from 'vitest'

import { importDocxManuscript } from './importDocxManuscript'

function u16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function u32(target: number[], value: number) {
  target.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  )
}

function docxFromXml(xml: string): ArrayBuffer {
  const encoder = new TextEncoder()
  const name = Array.from(encoder.encode('word/document.xml'))
  const content = Array.from(encoder.encode(xml))
  const output: number[] = []

  u32(output, 0x04034b50)
  u16(output, 20)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, content.length)
  u32(output, content.length)
  u16(output, name.length)
  u16(output, 0)
  output.push(...name, ...content)

  const centralOffset = output.length
  u32(output, 0x02014b50)
  u16(output, 20)
  u16(output, 20)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, content.length)
  u32(output, content.length)
  u16(output, name.length)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, 0)
  output.push(...name)
  const centralSize = output.length - centralOffset

  u32(output, 0x06054b50)
  u16(output, 0)
  u16(output, 0)
  u16(output, 1)
  u16(output, 1)
  u32(output, centralSize)
  u32(output, centralOffset)
  u16(output, 0)

  return new Uint8Array(output).buffer
}

const prefix = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Energy Audit</w:t></w:r></w:p>`
const suffix = '</w:body></w:document>'

describe('importDocxManuscript golden Word structures', () => {
  it('recognizes compact cells where the response line is stored in the same cell as its label', async () => {
    const xml = `${prefix}
<w:tbl>
<w:tr><w:tc><w:p><w:r><w:t>Date________________________________</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Sleep (hours)________________________________</w:t></w:r></w:p></w:tc></w:tr>
<w:tr><w:tc><w:p><w:r><w:t>Wake energy (0-10)________________________________</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Overall capacity today (0-10)________________________________</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
${suffix}`

    const result = await importDocxManuscript(docxFromXml(xml), 'energy.docx')

    expect(result.manuscript).toContain('### Date\n\n[[GP:RESPONSE size="short"]]')
    expect(result.manuscript).toContain('### Overall capacity today (0-10)')
    expect(result.manuscript).not.toContain('| Date')
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'inline-response-table-normalized' }),
    )
  })

  it('removes author-only notes when Word stores the marker and note in a one-cell table', async () => {
    const xml = `${prefix}
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>PRODUCT / LAYOUT NOTEDesign direction: calm, adult, minimal, spacious.</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
<w:p><w:r><w:t>Visible journal content.</w:t></w:r></w:p>
${suffix}`

    const result = await importDocxManuscript(docxFromXml(xml), 'journal.docx')

    expect(result.manuscript).not.toContain('PRODUCT / LAYOUT NOTE')
    expect(result.manuscript).not.toContain('Design direction')
    expect(result.manuscript).toContain('Visible journal content.')
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'author-only-section-removed' }),
    )
  })
})
