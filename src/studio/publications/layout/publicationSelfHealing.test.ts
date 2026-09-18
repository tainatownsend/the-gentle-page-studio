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

  it('heals a stranded heading across a preferred page break when the combined page fits', () => {
    const preferredHeading: PublicationBlock = {
      id: 'heading-6',
      type: 'heading',
      level: 2,
      text: 'Flexible break',
      layout: { pageBreakBefore: 'preferred' },
    }

    const healed = healPublicationPages(
      [[preferredHeading], [{ id: 'paragraph-8', type: 'paragraph', text: 'Body' }]],
      { capacityUnits: 48, estimateUnits },
    )

    expect(healed).toHaveLength(1)
    expect(healed[0]?.map((block) => block.id)).toEqual(['heading-6', 'paragraph-8'])
  })

  it('moves a forced heading-only page forward while preserving the authored boundary', () => {
    const forcedHeading: PublicationBlock = {
      id: 'heading-6',
      type: 'heading',
      level: 2,
      text: 'Daily Nervous System Check-in',
      layout: { pageBreakBefore: 'forced' },
    }

    const healed = healPublicationPages(
      [[forcedHeading], [{ id: 'paragraph-8', type: 'paragraph', text: 'Date & Time' }]],
      { capacityUnits: 48, estimateUnits },
    )

    expect(healed).toHaveLength(1)
    expect(healed[0]?.map((block) => block.id)).toEqual(['heading-6', 'paragraph-8'])
    expect(healed[0]?.[0]?.layout?.pageBreakBefore).toBe('forced')
  })

  it('preserves separate forced boundaries and level-one section openers', () => {
    const heading: PublicationBlock = {
      id: 'heading-6',
      type: 'heading',
      level: 2,
      text: 'Current section',
    }
    const nextForcedBlock: PublicationBlock = {
      id: 'paragraph-8',
      type: 'paragraph',
      text: 'Next authored section',
      layout: { pageBreakBefore: 'forced' },
    }
    const sectionHeading: PublicationBlock = {
      id: 'section-6',
      type: 'heading',
      level: 1,
      text: 'Part Four',
    }

    expect(
      healPublicationPages([[heading], [nextForcedBlock]], {
        capacityUnits: 48,
        estimateUnits,
      }),
    ).toHaveLength(2)

    expect(
      healPublicationPages(
        [[sectionHeading], [{ id: 'paragraph-8', type: 'paragraph', text: 'Body' }]],
        { capacityUnits: 48, estimateUnits },
      ),
    ).toHaveLength(2)
  })
})
