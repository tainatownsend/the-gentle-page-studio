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

  it('keeps escaped pipes inside markdown table cells', () => {
    const result = compileGentlePageManuscript(`# Journal

| Situation | Note |
| --- | --- |
| Work | Choose A \\| B |`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'table',
        columns: ['Situation', 'Note'],
        rows: [['Work', 'Choose A | B']],
      }),
    )
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

  it('attaches an explicit page template to the next publication block', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="emergency-tool"]]

## Emergency Unfreeze Protocol

Start small.`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'heading',
        text: 'Emergency Unfreeze Protocol',
        layout: expect.objectContaining({
          keepWithNext: true,
          pageTemplate: 'emergency-tool',
        }),
      }),
    )
    expect(result.diagnostics).toEqual([])
  })

  it('carries page template intent from a prompt heading into its response field', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="prompt-writing"]]

### What do I need right now?
[[GP:RESPONSE size="long"]]`)

    expect(result.content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'What do I need right now?',
        responseSize: 'long',
        layout: expect.objectContaining({
          pageTemplate: 'prompt-writing',
        }),
      }),
    ])
  })

  it('reports unsupported page templates without leaking them into reader-facing content', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="mystery-layout"]]

## Reflection`)

    expect(result.content.blocks).toHaveLength(1)
    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'heading',
        text: 'Reflection',
      }),
    )
    expect(JSON.stringify(result.content)).not.toContain('mystery-layout')
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'invalid-page-template',
        level: 'suggestion',
      }),
    ])
  })


  it('accepts the guided framework template used by the 4-State Self-Scan', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="guided-framework"]]

## The 4-State Self-Scan

- [ ] Hyperarousal
- [ ] Hypoarousal
- [ ] Underaroused
- [ ] Regulated Window`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'heading',
        text: 'The 4-State Self-Scan',
        layout: expect.objectContaining({
          pageTemplate: 'guided-framework',
        }),
      }),
    )
    expect(result.diagnostics).toEqual([])
  })


  it('accepts the Gate B tool overview and sensory reset templates', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="tool-overview"]]

## Daily Regulation Tools

### Breathe

Reset your body gently.

[[GP:PAGE_TEMPLATE type="sensory-reset"]]

## Sensory Reset

### Sight

Look at something calming.`)

    expect(
      result.content.blocks.find(
        (block) => block.type === 'heading' && block.text === 'Daily Regulation Tools',
      )?.layout?.pageTemplate,
    ).toBe('tool-overview')
    expect(
      result.content.blocks.find(
        (block) => block.type === 'heading' && block.text === 'Sensory Reset',
      )?.layout?.pageTemplate,
    ).toBe('sensory-reset')
    expect(result.diagnostics).toEqual([])
  })


  it('accepts the Gate C trigger scan and regulation menu templates', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:PAGE_TEMPLATE type="trigger-scan"]]

## Triggers & Early Signs

### Common Triggers

- [ ] Stress

[[GP:PAGE_TEMPLATE type="regulation-menu"]]

## Regulation Menu

### Quick Reset

[[GP:RESPONSE size="short"]]`)

    expect(
      result.content.blocks.find(
        (block) => block.type === 'heading' && block.text === 'Triggers & Early Signs',
      )?.layout?.pageTemplate,
    ).toBe('trigger-scan')
    expect(
      result.content.blocks.find(
        (block) =>
          block.type === 'heading' && block.text === 'Regulation Menu',
      )?.layout?.pageTemplate,
    ).toBe('regulation-menu')
    expect(result.diagnostics).toEqual([])
  })

})
