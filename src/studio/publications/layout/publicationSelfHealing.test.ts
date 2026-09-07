import { describe, expect, it } from 'vitest'

import type { PublicationBlock } from '../types'
import { healPublicationPages } from './publicationSelfHealing'

const estimateUnits = (block: PublicationBlock) => Number(block.id.split('-').at(-1) ?? 0)

describe('healPublicationPages', () => {
  it('merges an accidental heading-only page into the content it introduces', () => {
    const pages: PublicationBlock[][] = [
      [{ id: 'heading-6', type: 'heading', level: 2, text: 'Remembering' }],
      [
        { id: 'paragraph-10', type: 'paragraph', text: 'First item' },
        { id: 'paragraph-8', type: 'paragraph', text: 'Second item' },
      ],
    ]

    const healed = healPublicationPages(pages, {
      capacityUnits: 48,
      estimateUnits,
    })

    expect(healed).toHaveLength(1)
    expect(healed[0]?.map((block) => block.id)).toEqual([
      'heading-6',
      'paragraph-10',
      'paragraph-8',
    ])
  })

  it('preserves authored and level-one section openers', () => {
    const forcedHeading: PublicationBlock = {
      id: 'heading-6',
      type: 'heading',
      level: 2,
      text: 'Authored break',
      layout: { pageBreakBefore: 'forced' },
    }
    const sectionHeading: PublicationBlock = {
      id: 'section-6',
      type: 'heading',
      level: 1,
      text: 'Part Four',
    }

    expect(
      healPublicationPages(
        [[forcedHeading], [{ id: 'paragraph-8', type: 'paragraph', text: 'Body' }]],
        { capacityUnits: 48, estimateUnits },
      ),
    ).toHaveLength(2)

    expect(
      healPublicationPages(
        [[sectionHeading], [{ id: 'paragraph-8', type: 'paragraph', text: 'Body' }]],
        { capacityUnits: 48, estimateUnits },
      ),
    ).toHaveLength(2)
  })
})
