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

  it('moves a prompt page-break intent onto its response without copying heading keep-with-next', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_BREAK type="forced"]]

### Reflection

[[GP:RESPONSE size="medium"]]`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'Reflection',
        responseSize: 'medium',
        layout: {
          pageBreakBefore: 'forced',
        },
      }),
    ])
  })

  it('infers Word-style writing lines as one semantic response area', () => {
    const result = compileGentlePageManuscript(`# Journal

What would make this feel supportive?

____________________________
____________________________
____________________________
____________________________`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'What would make this feel supportive?',
        responseSize: 'long',
      }),
    ])
  })

  it('uses a short preceding label as the prompt for inferred writing space', () => {
    const result = compileGentlePageManuscript(`# Journal

Today I need

____________________________
____________________________`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'Today I need',
        responseSize: 'medium',
      }),
    ])
  })

  it('infers inline short fields without preserving underscore artifacts', () => {
    const result = compileGentlePageManuscript(`# Journal

Date: ____________________

Sleep hours ____________________`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'Date',
        responseSize: 'short',
      }),
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'Sleep hours',
        responseSize: 'short',
      }),
    ])
  })

  it('accepts common checkbox syntax copied from AI or Word', () => {
    const result = compileGentlePageManuscript(`# Journal

[ ] Reduce expectations
☐ Ask for help
□ Protect a break`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({ type: 'checkbox-field', text: 'Reduce expectations' }),
      expect.objectContaining({ type: 'checkbox-field', text: 'Ask for help' }),
      expect.objectContaining({ type: 'checkbox-field', text: 'Protect a break' }),
    ])
  })

  it('conservatively recognizes common plain-text section markers', () => {
    const result = compileGentlePageManuscript(`# Journal

PHASE 1 — STABILIZE

Reduce immediate strain.`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'heading',
        level: 2,
        text: 'PHASE 1 — STABILIZE',
        layout: expect.objectContaining({ keepWithNext: true }),
      }),
    )
    expect(result.content.blocks[1]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        text: 'Reduce immediate strain.',
      }),
    )
  })

  it('infers an all-caps manuscript title when Markdown is not present', () => {
    const result = compileGentlePageManuscript(`BURNOUT RECOVERY JOURNAL

A capacity-first workbook.

PHASE 1 — STABILIZE`)

    expect(result.title).toBe('BURNOUT RECOVERY JOURNAL')
    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({ type: 'paragraph', text: 'A capacity-first workbook.' }),
    )
    expect(result.content.blocks[1]).toEqual(
      expect.objectContaining({ type: 'heading', text: 'PHASE 1 — STABILIZE' }),
    )
  })
})
