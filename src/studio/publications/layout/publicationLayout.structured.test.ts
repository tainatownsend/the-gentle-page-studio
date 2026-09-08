import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout, estimatePublicationBlockUnits } from './publicationLayout'

describe('structured publication layout', () => {
  it('estimates rating fields as bounded interactive content', () => {
    const units = estimatePublicationBlockUnits({
      id: 'rating-1',
      type: 'rating-field',
      text: 'Energy right now',
      min: 0,
      max: 10,
    })

    expect(units).toBeGreaterThan(0)
    expect(units).toBeLessThan(48)
  })

  it('keeps a markdown-style worksheet table intact on a fresh page when it fits there', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'a'.repeat(900),
          },
          {
            id: 'table-1',
            type: 'table',
            text: '',
            columns: ['Area', 'Capacity', 'What would help?'],
            rows: [
              ['Physical', 'Low', 'More rest'],
              ['Mental', 'Medium', 'Fewer decisions'],
              ['Emotional', 'Low', 'More support'],
            ],
          },
        ],
      },
    })

    const pages = createPublicationLayout(publication).pages.filter((page) => page.kind === 'content')

    expect(pages).toHaveLength(2)
    expect(pages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(pages[1]?.blocks.map((block) => block.id)).toEqual(['table-1'])
  })

  it('moves a consecutive checkbox group together instead of stranding its final options', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'a'.repeat(720),
          },
          { id: 'check-1', type: 'checkbox-field', text: 'Reduce expectations' },
          { id: 'check-2', type: 'checkbox-field', text: 'Ask for help' },
          { id: 'check-3', type: 'checkbox-field', text: 'Protect a break' },
        ],
      },
    })

    const pages = createPublicationLayout(publication).pages.filter((page) => page.kind === 'content')

    expect(pages).toHaveLength(2)
    expect(pages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(pages[1]?.blocks.map((block) => block.id)).toEqual(['check-1', 'check-2', 'check-3'])
  })
})
