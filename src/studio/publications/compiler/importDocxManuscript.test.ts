import { describe, expect, it } from 'vitest'

import { compileGentlePageManuscript } from './compileGentlePageManuscript'
import { convertDocxXmlToGentlePageManuscript } from './importDocxManuscript'

const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title" />
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1" />
  </w:style>
</w:styles>`

const numberingXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0">
      <w:numFmt w:val="bullet" />
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="7">
    <w:abstractNumId w:val="1" />
  </w:num>
</w:numbering>`

const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title" /></w:pPr>
      <w:r><w:t>Burnout Recovery Journal</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1" />
        <w:pageBreakBefore />
      </w:pPr>
      <w:r><w:t>Phase 1 — Stabilize</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>What would make today feel more supportive?</w:t></w:r></w:p>
    <w:p><w:r><w:t>________________________</w:t></w:r></w:p>
    <w:p><w:r><w:t>________________________</w:t></w:r></w:p>
    <w:p><w:r><w:t>☐ Ask for help</w:t></w:r></w:p>
    <w:p>
      <w:pPr>
        <w:numPr><w:ilvl w:val="0" /><w:numId w:val="7" /></w:numPr>
      </w:pPr>
      <w:r><w:t>Protect a break</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Area</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Current capacity</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Physical</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Low</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`

describe('convertDocxXmlToGentlePageManuscript', () => {
  it('preserves Word order while translating structure into Gentle Page semantics', () => {
    const result = convertDocxXmlToGentlePageManuscript(
      documentXml,
      stylesXml,
      numberingXml,
    )

    expect(result.manuscript).toContain('# Burnout Recovery Journal')
    expect(result.manuscript).toContain('[[GP:PAGE_BREAK type="preferred"]]')
    expect(result.manuscript).toContain('## Phase 1 — Stabilize')
    expect(result.manuscript).toContain('What would make today feel more supportive?')
    expect(result.manuscript).toContain('[[GP:RESPONSE size="medium"]]')
    expect(result.manuscript).toContain('- [ ] Ask for help')
    expect(result.manuscript).toContain('- Protect a break')
    expect(result.manuscript).toContain('| Area | Current capacity |')
    expect(result.manuscript).toContain('| Physical | Low |')

    expect(result.stats).toMatchObject({
      tables: 1,
      listItems: 1,
      checkboxItems: 1,
      responseAreas: 1,
      pageBreakHints: 1,
    })
  })

  it('feeds imported Word structure through the same publication compiler', () => {
    const imported = convertDocxXmlToGentlePageManuscript(documentXml, stylesXml, numberingXml)
    const compiled = compileGentlePageManuscript(imported.manuscript)

    expect(compiled.title).toBe('Burnout Recovery Journal')
    expect(compiled.content.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'heading',
          text: 'Phase 1 — Stabilize',
          layout: expect.objectContaining({ pageBreakBefore: 'preferred' }),
        }),
        expect.objectContaining({
          type: 'multiline-text-field',
          text: 'What would make today feel more supportive?',
          responseSize: 'medium',
        }),
        expect.objectContaining({
          type: 'checkbox-field',
          text: 'Ask for help',
        }),
        expect.objectContaining({
          type: 'table',
          text: expect.stringContaining('| Area | Current capacity |'),
        }),
      ]),
    )
  })

  it('treats a manual Word page break as a forced page break', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:br w:type="page" /></w:r></w:p>
          <w:p><w:r><w:t>New page content</w:t></w:r></w:p>
        </w:body>
      </w:document>`

    const result = convertDocxXmlToGentlePageManuscript(xml)

    expect(result.manuscript).toBe(
      '[[GP:PAGE_BREAK type="forced"]]\n\nNew page content',
    )
    expect(result.stats.pageBreakHints).toBe(1)
  })
})
