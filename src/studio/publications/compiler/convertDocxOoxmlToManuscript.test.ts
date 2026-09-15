import { describe, expect, it } from 'vitest'

import { convertDocxOoxmlToManuscript } from './convertDocxOoxmlToManuscript'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function documentXml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${WORD_NS}">
  <w:body>${body}</w:body>
</w:document>`
}

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${WORD_NS}">
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title" /></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1" /></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2" /></w:style>
  <w:style w:type="paragraph" w:styleId="SmallLabel"><w:name w:val="Small Label" /></w:style>
</w:styles>`

describe('convertDocxOoxmlToManuscript', () => {
  it('preserves paragraph and table order while mapping Word styles to manuscript semantics', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:pPr><w:pStyle w:val="Title" /></w:pPr><w:r><w:t>Energy Audit</w:t></w:r></w:p>
        <w:p><w:pPr><w:pStyle w:val="Heading1" /></w:pPr><w:r><w:t>Before You Begin</w:t></w:r></w:p>
        <w:p><w:r><w:t>Notice what gives and takes energy.</w:t></w:r></w:p>
        <w:tbl>
          <w:tr><w:tc><w:p><w:r><w:t>Area</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Capacity</w:t></w:r></w:p></w:tc></w:tr>
          <w:tr><w:tc><w:p><w:r><w:t>Physical</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Low</w:t></w:r></w:p></w:tc></w:tr>
        </w:tbl>
        <w:p><w:pPr><w:pStyle w:val="Heading2" /></w:pPr><w:r><w:t>Reflection</w:t></w:r></w:p>
      `),
      stylesXml,
    )

    expect(result.manuscript).toBe(`# Energy Audit

## Before You Begin

Notice what gives and takes energy.

| Area | Capacity |
| --- | --- |
| Physical | Low |

### Reflection`)
    expect(result.diagnostics).toEqual([])
  })

  it('maps Word small-label paragraphs to compact headings that can stay with their section', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:pPr><w:pStyle w:val="SmallLabel" /><w:pageBreakBefore /></w:pPr><w:r><w:t>PHASE 3</w:t></w:r></w:p>
        <w:p><w:pPr><w:pStyle w:val="Heading1" /></w:pPr><w:r><w:t>Energy Audit</w:t></w:r></w:p>
      `),
      stylesXml,
    )

    expect(result.manuscript).toBe(`[[GP:PAGE_BREAK type="preferred"]]

### PHASE 3

## Energy Audit`)
  })

  it('flattens single-column Word callouts instead of leaking Markdown table syntax', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:tbl>
          <w:tr><w:tc>
            <w:p><w:r><w:t>Today's mini-experiment</w:t></w:r></w:p>
            <w:p><w:r><w:t>Observe your normal rhythm.</w:t></w:r></w:p>
          </w:tc></w:tr>
        </w:tbl>
      `),
    )

    expect(result.manuscript).toBe("Today's mini-experiment Observe your normal rhythm.")
    expect(result.manuscript).not.toContain('|')
    expect(result.manuscript).not.toContain('---')
  })

  it('normalizes Word table line breaks without exposing HTML break markers', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:tbl>
          <w:tr>
            <w:tc><w:p><w:r><w:t>Field</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>Value</w:t></w:r></w:p></w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>Date</w:t></w:r></w:p>
              <w:p><w:r><w:t>________________</w:t></w:r></w:p>
            </w:tc>
            <w:tc><w:p><w:r><w:t>Today</w:t></w:r></w:p></w:tc>
          </w:tr>
        </w:tbl>
      `),
    )

    expect(result.manuscript).toContain('| Date ________________ | Today |')
    expect(result.manuscript).not.toContain('<br>')
  })

  it('maps pageBreakBefore and manual page breaks to preferred and forced page intent', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:r><w:t>Introduction</w:t></w:r></w:p>
        <w:p><w:pPr><w:pageBreakBefore /></w:pPr><w:r><w:t>Phase 1</w:t></w:r></w:p>
        <w:p><w:r><w:br w:type="page" /><w:t>Phase 2</w:t></w:r></w:p>
      `),
    )

    expect(result.manuscript).toBe(`Introduction

[[GP:PAGE_BREAK type="preferred"]]

Phase 1

[[GP:PAGE_BREAK type="forced"]]

Phase 2`)
  })

  it('converts checkbox glyphs and consecutive writing lines into semantic fields', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:r><w:t>What would support me today?</w:t></w:r></w:p>
        <w:p><w:r><w:t>____________________________</w:t></w:r></w:p>
        <w:p><w:r><w:t>____________________________</w:t></w:r></w:p>
        <w:p><w:r><w:t>____________________________</w:t></w:r></w:p>
        <w:p><w:r><w:t>☐ Reduce expectations</w:t></w:r></w:p>
        <w:p><w:r><w:t>□ Ask for help</w:t></w:r></w:p>
        <w:p><w:r><w:t>[ ] Protect a break</w:t></w:r></w:p>
      `),
    )

    expect(result.manuscript).toBe(`What would support me today?

[[GP:RESPONSE size="long"]]

- [ ] Reduce expectations

- [ ] Ask for help

- [ ] Protect a break`)
  })

  it('preserves recognized product notes as author-only manuscript content', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:r><w:t>Visible introduction.</w:t></w:r></w:p>
        <w:p><w:r><w:t>PRODUCT / LAYOUT NOTE: Keep this page spacious.</w:t></w:r></w:p>
        <w:p><w:r><w:t>Visible reflection.</w:t></w:r></w:p>
      `),
    )

    expect(result.manuscript).toContain(`[[GP:AUTHOR_NOTE]]
PRODUCT / LAYOUT NOTE: Keep this page spacious.
[[GP:END]]`)
    expect(result.manuscript).toContain('Visible introduction.')
    expect(result.manuscript).toContain('Visible reflection.')
  })

  it('filters table-contained product notes without hiding adjacent reader content', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:r><w:t>Visible introduction.</w:t></w:r></w:p>
        <w:tbl>
          <w:tr><w:tc>
            <w:p><w:r><w:t>PRODUCT / LAYOUT NOTE</w:t></w:r></w:p>
            <w:p><w:r><w:t>Internal layout guidance that must never reach readers.</w:t></w:r></w:p>
          </w:tc></w:tr>
        </w:tbl>
        <w:p><w:r><w:t>Visible reflection.</w:t></w:r></w:p>
      `),
    )

    expect(result.manuscript).toBe(`Visible introduction.

Visible reflection.`)
    expect(result.manuscript).not.toContain('PRODUCT / LAYOUT NOTE')
    expect(result.manuscript).not.toContain('Internal layout guidance')
  })

  it('treats a standalone INTERNAL DRAFT NOTE as the start of a trailing author-only section', () => {
    const result = convertDocxOoxmlToManuscript(
      documentXml(`
        <w:p><w:r><w:t>Visible closing reflection.</w:t></w:r></w:p>
        <w:p><w:r><w:t>INTERNAL DRAFT NOTE</w:t></w:r></w:p>
        <w:p><w:r><w:t>Product Component Library</w:t></w:r></w:p>
        <w:tbl>
          <w:tr><w:tc><w:p><w:r><w:t>Component</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Digital opportunity</w:t></w:r></w:p></w:tc></w:tr>
          <w:tr><w:tc><w:p><w:r><w:t>Quick capture</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Internal only</w:t></w:r></w:p></w:tc></w:tr>
        </w:tbl>
        <w:tbl>
          <w:tr><w:tc>
            <w:p><w:r><w:t>PRODUCT / LAYOUT NOTE</w:t></w:r></w:p>
            <w:p><w:r><w:t>Do not expose this guidance.</w:t></w:r></w:p>
          </w:tc></w:tr>
        </w:tbl>
      `),
    )

    expect(result.manuscript).toBe('Visible closing reflection.')
    expect(result.manuscript).not.toContain('INTERNAL DRAFT NOTE')
    expect(result.manuscript).not.toContain('Product Component Library')
    expect(result.manuscript).not.toContain('Quick capture')
  })

  it('returns a safe diagnostic when the document body is missing', () => {
    const result = convertDocxOoxmlToManuscript(
      `<?xml version="1.0"?><w:document xmlns:w="${WORD_NS}" />`,
    )

    expect(result.manuscript).toBe('')
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'missing-document-body',
      }),
    ])
  })
})
