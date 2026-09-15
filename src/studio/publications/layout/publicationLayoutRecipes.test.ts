import { describe, expect, it } from 'vitest'

import type { PublicationBlock } from '../types'
import { getPublicationPageLayoutRecipe } from './publicationLayoutRecipes'

describe('getPublicationPageLayoutRecipe', () => {
  it('uses spacious composition for section openers', () => {
    const blocks: PublicationBlock[] = [
      { id: 'section', type: 'heading', level: 1, text: 'Part One' },
      { id: 'intro', type: 'paragraph', text: 'A gentle orientation.' },
    ]

    expect(getPublicationPageLayoutRecipe(blocks)).toMatchObject({
      archetype: 'section-opener',
      density: 'spacious',
      preferWholePageTool: true,
    })
  })

  it('uses compact composition for worksheet tables', () => {
    const blocks: PublicationBlock[] = [
      {
        id: 'table',
        type: 'table',
        text: 'Weekly dashboard',
        columns: ['Area', 'Status'],
        rows: [['Work', '']],
      },
    ]

    expect(getPublicationPageLayoutRecipe(blocks)).toMatchObject({
      archetype: 'worksheet',
      density: 'compact',
      preferWholePageTool: true,
    })
  })
})
