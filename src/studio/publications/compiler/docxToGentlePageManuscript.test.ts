import { describe, expect, it } from 'vitest'

import { docxDocumentXmlToManuscript, GentlePageDocxError } from './docxToGentlePageManuscript'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function documentXml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${WORD_NS}"><w:body>${body}</w:body></w:document>`
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

  it('rejects malformed Word XML', () => {
    expect(() => docxDocumentXmlToManuscript('<not-closed>')).toThrow(GentlePageDocxError)
  })
})
