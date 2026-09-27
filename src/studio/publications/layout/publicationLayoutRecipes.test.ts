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
      preferBalancedWhitespace: true,
    })
  })

  it('uses comfortable balanced composition for worksheet tables', () => {
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
      density: 'comfortable',
      preferWholePageTool: true,
      preferBalancedWhitespace: true,
    })
  })

  it('uses an explicit page template instead of relying only on inferred content shape', () => {
    const blocks: PublicationBlock[] = [
      {
        id: 'heading',
        type: 'heading',
        level: 2,
        text: 'Daily Check-In',
        layout: {
          pageTemplate: 'daily-check-in',
        },
      },
      {
        id: 'intro',
        type: 'paragraph',
        text: 'A small pause for a brighter day.',
      },
    ]

    expect(getPublicationPageLayoutRecipe(blocks)).toMatchObject({
      archetype: 'content',
      pageTemplate: 'daily-check-in',
      density: 'comfortable',
      preferWholePageTool: true,
      preferBalancedWhitespace: true,
    })
  })


  it('supports the guided framework family used by state education pages', () => {
    const blocks: PublicationBlock[] = [
      {
        id: 'states',
        type: 'heading',
        level: 2,
        text: 'The 4-State Self-Scan',
        layout: {
          pageTemplate: 'guided-framework',
        },
      },
      {
        id: 'state-option',
        type: 'checkbox-field',
        text: 'Hyperarousal',
      },
    ]

    expect(getPublicationPageLayoutRecipe(blocks)).toMatchObject({
      pageTemplate: 'guided-framework',
      density: 'comfortable',
      preferWholePageTool: true,
      preferBalancedWhitespace: true,
    })
  })

})
