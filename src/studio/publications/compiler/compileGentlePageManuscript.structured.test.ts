import { describe, expect, it } from 'vitest'

import { compileGentlePageManuscript } from './compileGentlePageManuscript'

describe('compileGentlePageManuscript structured content', () => {
  it('keeps a Markdown worksheet table as one semantic paragraph block', () => {
    const result = compileGentlePageManuscript(`# Capacity Journal

## Capacity baseline

| Area | Current capacity | What would make it easier? |
| --- | --- | --- |
| Physical | Low | Rest |
| Mental | Medium | Fewer decisions |

### What did you notice?

[[GP:RESPONSE size="medium"]]`)

    expect(result.content.blocks[1]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        format: 'table',
        text: expect.stringContaining('| Physical | Low | Rest |'),
      }),
    )
    expect(result.content.blocks.filter((block) => block.type === 'paragraph' && block.format === 'table')).toHaveLength(1)
  })

  it('marks compiled rating scales with semantic presentation', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:RATING min="0" max="3"]]`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        format: 'rating-scale',
        text: '0   1   2   3',
      }),
    )
  })
})
