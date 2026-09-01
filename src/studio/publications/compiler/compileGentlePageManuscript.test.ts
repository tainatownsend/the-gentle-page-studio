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

  it('compiles a rating directive into a first-class rating field', () => {
    const result = compileGentlePageManuscript(`# Journal

### Energy right now

[[GP:RATING min="0" max="10"]]`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'rating-field',
        text: 'Energy right now',
        min: 0,
        max: 10,
      }),
    ])
    expect(result.diagnostics).toEqual([])
  })

  it('normalizes unsafe rating ranges rather than failing compilation', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:RATING min="10" max="1"]]`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'rating-field',
        min: 0,
        max: 10,
      }),
    )
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'rating-range-normalized',
        level: 'suggestion',
      }),
    ])
  })

  it('preserves markdown worksheets as first-class tables', () => {
    const result = compileGentlePageManuscript(`# Journal

| Area | Current capacity | What would make it easier? |
| --- | --- | --- |
| Physical | Low | More rest |
| Mental | Medium | Fewer decisions |`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'table',
        columns: ['Area', 'Current capacity', 'What would make it easier?'],
        rows: [
          ['Physical', 'Low', 'More rest'],
          ['Mental', 'Medium', 'Fewer decisions'],
        ],
      }),
    ])
  })

  it('tags every block inside a repeatable page with the same semantic group', () => {
    const result = compileGentlePageManuscript(`# Journal

Intro paragraph.

[[GP:REPEATABLE_PAGE name="Daily Recovery Check-in"]]

## Daily Recovery Check-in

### Energy right now
[[GP:RATING min="0" max="10"]]

### What would support me today?
[[GP:RESPONSE size="medium"]]

[[GP:END_REPEATABLE_PAGE]]

Closing paragraph.`)

    const groupedBlocks = result.content.blocks.filter((block) => block.semanticGroup)

    expect(groupedBlocks).toHaveLength(3)
    expect(new Set(groupedBlocks.map((block) => block.semanticGroup?.id)).size).toBe(1)
    expect(groupedBlocks.every((block) => block.semanticGroup?.kind === 'repeatable-page')).toBe(
      true,
    )
    expect(groupedBlocks.every((block) => block.semanticGroup?.name === 'Daily Recovery Check-in')).toBe(
      true,
    )
    expect(result.content.blocks[0]?.semanticGroup).toBeUndefined()
    expect(result.content.blocks.at(-1)?.semanticGroup).toBeUndefined()
  })

  it('infers prompt-response and checkbox groups without overriding repeatable groups', () => {
    const result = compileGentlePageManuscript(`# Journal

### What would help today?
[[GP:RESPONSE size="medium"]]

- [ ] Ask for help
- [ ] Protect a break`)

    expect(result.content.blocks[0]?.semanticGroup).toEqual(
      expect.objectContaining({ kind: 'prompt-response', name: 'What would help today?' }),
    )
    expect(result.content.blocks[1]?.semanticGroup).toEqual(
      expect.objectContaining({ kind: 'checkbox-group' }),
    )
    expect(result.content.blocks[2]?.semanticGroup?.id).toBe(
      result.content.blocks[1]?.semanticGroup?.id,
    )
  })

  it('preserves an unterminated repeatable page and reports one optional suggestion', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:REPEATABLE_PAGE name="Weekly Review"]]

## Weekly Review

Reflection content.`)

    expect(result.content.blocks.every((block) => block.semanticGroup?.name === 'Weekly Review')).toBe(
      true,
    )
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'unterminated-repeatable-page',
        level: 'suggestion',
      }),
    ])
  })
})
