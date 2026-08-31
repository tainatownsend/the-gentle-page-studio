import { describe, expect, it } from 'vitest'

import { compileGentlePageManuscript } from './compileGentlePageManuscript'

describe('compileGentlePageManuscript structured content', () => {
  it('keeps a Markdown worksheet table as one first-class table block', () => {
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
        type: 'table',
        text: expect.stringContaining('| Physical | Low | Rest |'),
      }),
    )
    expect(result.content.blocks.filter((block) => block.type === 'table')).toHaveLength(1)
  })

  it('compiles rating directives into first-class rating fields', () => {
    const result = compileGentlePageManuscript(`# Journal

[[GP:RATING min="0" max="3"]]`)

    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'rating-field',
        text: 'Rating',
        min: 0,
        max: 3,
      }),
    )
  })
})
