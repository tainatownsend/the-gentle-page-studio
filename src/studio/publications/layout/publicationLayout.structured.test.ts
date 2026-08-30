import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout, estimatePublicationBlockUnits } from './publicationLayout'

describe('structured journal layout', () => {
  it('gives table and rating blocks deterministic non-zero layout estimates', () => {
    const table = {
      id: 'table-1',
      type: 'table' as const,
      text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |\n| Mental | Medium |',
    }
    const rating = {
      id: 'rating-1',
      type: 'rating-field' as const,
      text: 'Energy right now',
      min: 0,
      max: 10,
    }

    expect(estimatePublicationBlockUnits(table)).toBeGreaterThan(0)
    expect(estimatePublicationBlockUnits(rating)).toBeGreaterThan(0)
  })

  it('keeps structured blocks in manuscript order while paginating them', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'heading-1',
            type: 'heading',
            level: 2,
            text: 'Capacity map',
          },
          {
            id: 'table-1',
            type: 'table',
            text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |',
          },
          {
            id: 'rating-1',
            type: 'rating-field',
            text: 'Energy right now',
            min: 0,
            max: 10,
          },
        ],
      },
    })

    const contentPages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(contentPages.flatMap((page) => page.blocks.map((block) => block.id))).toEqual([
      'heading-1',
      'table-1',
      'rating-1',
    ])
  })
})
