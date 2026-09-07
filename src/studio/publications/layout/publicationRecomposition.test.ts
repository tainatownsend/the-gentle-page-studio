import { describe, expect, it } from 'vitest'

import type { PublicationBlock } from '../types'
import { recomposePublicationPages } from './publicationRecomposition'

const estimateUnits = (block: PublicationBlock) => Number(block.id.split('-').at(-1) ?? 0)

describe('recomposePublicationPages', () => {
  it('moves a trailing semantic unit forward when it produces better page balance', () => {
    const pages: PublicationBlock[][] = [
      [
        { id: 'paragraph-20', type: 'paragraph', text: 'A' },
        { id: 'paragraph-12', type: 'paragraph', text: 'B' },
        { id: 'paragraph-8', type: 'paragraph', text: 'C' },
      ],
      [{ id: 'paragraph-10', type: 'paragraph', text: 'D' }],
    ]

    const recomposed = recomposePublicationPages(pages, {
      capacityUnits: 48,
      minimumBalancedPageUnits: 18,
      estimateUnits,
    })

    expect(recomposed[0]?.map((block) => block.id)).toEqual(['paragraph-20', 'paragraph-12'])
    expect(recomposed[1]?.map((block) => block.id)).toEqual(['paragraph-8', 'paragraph-10'])
  })

  it('keeps authored page breaks and repeatable page boundaries intact', () => {
    const forced: PublicationBlock = {
      id: 'forced-8',
      type: 'paragraph',
      text: 'New page',
      layout: { pageBreakBefore: 'forced' },
    }
    const pages: PublicationBlock[][] = [
      [
        { id: 'paragraph-20', type: 'paragraph', text: 'A' },
        { id: 'paragraph-12', type: 'paragraph', text: 'B' },
        { id: 'paragraph-8', type: 'paragraph', text: 'C' },
      ],
      [forced],
    ]

    const recomposed = recomposePublicationPages(pages, {
      capacityUnits: 48,
      minimumBalancedPageUnits: 18,
      estimateUnits,
    })

    expect(recomposed[0]).toHaveLength(3)
    expect(recomposed[1]?.[0]?.id).toBe('forced-8')
  })
})
