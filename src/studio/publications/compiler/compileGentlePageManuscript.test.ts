import { describe, expect, it } from 'vitest'

import { compileGentlePageManuscript } from './compileGentlePageManuscript'

describe('compileGentlePageManuscript', () => {
  it('compiles a Gentle Page manuscript into existing publication blocks', () => {
    const result = compileGentlePageManuscript(`# Burnout Recovery Journal

A capacity-first workbook.

[[GP:PAGE_BREAK type="preferred"]]

## Before You Begin

### What would make this feel supportive?

[[GP:RESPONSE size="long"]]

- [ ] I want shorter prompts
- [ ] I want more structure`)

    expect(result.title).toBe('Burnout Recovery Journal')
    expect(result.detectedProtocol).toBe(true)
    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'paragraph',
        text: 'A capacity-first workbook.',
      }),
      expect.objectContaining({
        type: 'heading',
        level: 2,
        text: 'Before You Begin',
        layout: expect.objectContaining({
          pageBreakBefore: 'preferred',
          keepWithNext: true,
        }),
      }),
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'What would make this feel supportive?',
        responseSize: 'long',
      }),
      expect.objectContaining({
        type: 'checkbox-field',
        text: 'I want shorter prompts',
      }),
      expect.objectContaining({
        type: 'checkbox-field',
        text: 'I want more structure',
      }),
    ])
  })

  it('keeps author notes out of publication output', () => {
    const result = compileGentlePageManuscript(`# Journal

Visible paragraph.

[[GP:AUTHOR_NOTE]]
This should never appear in the publication.
[[GP:END]]

Visible again.`)

    expect(result.content.blocks.map((block) => block.text)).toEqual([
      'Visible paragraph.',
      'Visible again.',
    ])
  })

  it('uses a safe fallback instead of dropping unknown directives', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:SOMETHING_NEW]]`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        text: '[[GP:SOMETHING_NEW]]',
      }),
    )
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'unknown-directive',
        level: 'suggestion',
      }),
    ])
  })

  it('defaults a page break without a type to preferred', () => {
    const result = compileGentlePageManuscript(`# Journal

First paragraph.

[[GP:PAGE_BREAK]]

## Next section`)

    expect(result.content.blocks[1]).toEqual(
      expect.objectContaining({
        type: 'heading',
        layout: expect.objectContaining({
          pageBreakBefore: 'preferred',
        }),
      }),
    )
  })
})
