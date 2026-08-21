import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout } from './publicationLayout'

describe('createPublicationLayout', () => {
  it('projects a fixed cover followed by numbered publication content', () => {
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
          id: 'journal-1-cover',
          sequence: 1,
          kind: 'cover',
          blocks: [],
        },
        {
          id: 'journal-1-content-page-1',
          sequence: 2,
          kind: 'content',
          pageNumber: 1,
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
    const contentPage = layout.pages.find((page) => page.kind === 'content')

    expect(layout.settings).not.toBe(publication.documentSettings)
    expect(layout.settings.margins).not.toBe(publication.documentSettings.margins)
    expect(contentPage?.blocks).not.toBe(publication.content.blocks)
    expect(contentPage?.blocks[0]).not.toBe(publication.content.blocks[0])
  })

  it('keeps the cover unnumbered and creates an empty numbered content page', () => {
    const publication = createPublicationFixture()
    const layout = createPublicationLayout(publication)

    expect(layout.pages[0]).toMatchObject({
      kind: 'cover',
      pageNumber: undefined,
    })

    expect(layout.pages[1]).toEqual({
      id: 'publication-1-content-page-1',
      sequence: 2,
      kind: 'content',
      pageNumber: 1,
      blocks: [],
    })
  })
})
