import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout } from './publicationLayout'

describe('compound journal pagination', () => {
  it('moves a heading with its checkbox section instead of leaving the heading alone', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'a'.repeat(700),
          },
          {
            id: 'remembering',
            type: 'heading',
            level: 2,
            text: 'Remembering',
          },
          {
            id: 'check-1',
            type: 'checkbox-field',
            text: 'I remember things at inconvenient times.',
          },
          {
            id: 'check-2',
            type: 'checkbox-field',
            text: 'If I cannot see something, I may forget it exists.',
          },
          {
            id: 'check-3',
            type: 'checkbox-field',
            text: 'I lose track of appointments or deadlines.',
          },
          {
            id: 'check-4',
            type: 'checkbox-field',
            text: 'I forget what I was doing after an interruption.',
          },
        ],
      },
    })

    const pages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(pages).toHaveLength(2)
    expect(pages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(pages[1]?.blocks.map((block) => block.id)).toEqual([
      'remembering',
      'check-1',
      'check-2',
      'check-3',
      'check-4',
    ])
  })
})
