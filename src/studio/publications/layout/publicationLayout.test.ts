import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout } from './publicationLayout'

describe('createPublicationLayout', () => {
  it('projects publication content into a derived content page', () => {
    const publication = createPublicationFixture({
      id: 'journal-1',
      content: {
        blocks: [
          {
            id: 'heading-1',
            type: 'heading',
            level: 1,
            text: 'Begin here',
          },
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Take one gentle step.',
          },
        ],
      },
    })

    expect(createPublicationLayout(publication)).toEqual({
      settings: publication.documentSettings,
      pages: [
        {
          id: 'journal-1-content-page-1',
          sequence: 1,
          kind: 'content',
          blocks: publication.content.blocks,
        },
      ],
    })
  })

  it('returns independent layout data without mutating publication data', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Original text',
          },
        ],
      },
    })

    const layout = createPublicationLayout(publication)

    expect(layout.settings).not.toBe(publication.documentSettings)
    expect(layout.settings.margins).not.toBe(publication.documentSettings.margins)
    expect(layout.pages[0]?.blocks).not.toBe(publication.content.blocks)
    expect(layout.pages[0]?.blocks[0]).not.toBe(publication.content.blocks[0])
  })

  it('creates an empty content page for an empty publication', () => {
    const publication = createPublicationFixture()

    expect(createPublicationLayout(publication).pages).toEqual([
      {
        id: 'publication-1-content-page-1',
        sequence: 1,
        kind: 'content',
        blocks: [],
      },
    ])
  })
})
