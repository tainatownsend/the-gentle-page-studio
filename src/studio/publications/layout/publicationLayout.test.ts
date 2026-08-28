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

  it('flows larger content into sequential derived pages without reordering blocks', () => {
    const blocks = Array.from({ length: 5 }, (_, index) => ({
      id: `paragraph-${index + 1}`,
      type: 'paragraph' as const,
      text: `${index + 1}-${'a'.repeat(198)}`,
    }))

    const publication = createPublicationFixture({
      id: 'long-journal',
      content: {
        blocks,
      },
    })

    const layout = createPublicationLayout(publication)
    const contentPages = layout.pages.filter((page) => page.kind === 'content')

    expect(contentPages).toHaveLength(2)
    expect(contentPages.map((page) => page.pageNumber)).toEqual([1, 2])
    expect(contentPages.map((page) => page.sequence)).toEqual([2, 3])
    expect(contentPages.flatMap((page) => page.blocks.map((block) => block.id))).toEqual(
      blocks.map((block) => block.id),
    )
    expect(contentPages[0]?.blocks).toHaveLength(4)
    expect(contentPages[1]?.blocks).toHaveLength(1)
  })

  it('keeps a single oversized block intact instead of splitting authored content', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'long-paragraph',
            type: 'paragraph',
            text: 'a'.repeat(3000),
          },
        ],
      },
    })

    const layout = createPublicationLayout(publication)
    const contentPages = layout.pages.filter((page) => page.kind === 'content')

    expect(contentPages).toHaveLength(1)
    expect(contentPages[0]?.blocks).toHaveLength(1)
    expect(contentPages[0]?.blocks[0]?.id).toBe('long-paragraph')
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

    expect(layout.pages[0]?.kind).toBe('cover')
    expect(layout.pages[0]?.pageNumber).toBeUndefined()

    expect(layout.pages[1]).toEqual({
      id: 'publication-1-content-page-1',
      sequence: 2,
      kind: 'content',
      pageNumber: 1,
      blocks: [],
    })
  })

  it('honors a forced page break before authored content', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'Short introduction.',
          },
          {
            id: 'section',
            type: 'heading',
            level: 1,
            text: 'New section',
            layout: {
              pageBreakBefore: 'forced',
            },
          },
          {
            id: 'body',
            type: 'paragraph',
            text: 'Section body.',
          },
        ],
      },
    })

    const contentPages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(contentPages).toHaveLength(2)
    expect(contentPages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(contentPages[1]?.blocks.map((block) => block.id)).toEqual(['section', 'body'])
  })

  it('honors a preferred page break after the current page has meaningful content', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'a'.repeat(450),
          },
          {
            id: 'section',
            type: 'heading',
            level: 1,
            text: 'New section',
            layout: {
              pageBreakBefore: 'preferred',
            },
          },
          {
            id: 'body',
            type: 'paragraph',
            text: 'Section body.',
          },
        ],
      },
    })

    const contentPages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(contentPages).toHaveLength(2)
    expect(contentPages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(contentPages[1]?.blocks.map((block) => block.id)).toEqual(['section', 'body'])
  })

  it('keeps a preferred break flexible when moving content would waste most of the page', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'Short introduction.',
          },
          {
            id: 'section',
            type: 'heading',
            level: 1,
            text: 'New section',
            layout: {
              pageBreakBefore: 'preferred',
            },
          },
          {
            id: 'body',
            type: 'paragraph',
            text: 'Section body.',
          },
        ],
      },
    })

    const contentPages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(contentPages).toHaveLength(1)
    expect(contentPages[0]?.blocks.map((block) => block.id)).toEqual(['intro', 'section', 'body'])
  })

  it('moves a heading with its following block instead of orphaning the heading', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'intro',
            type: 'paragraph',
            text: 'a'.repeat(700),
          },
          {
            id: 'heading',
            type: 'heading',
            level: 2,
            text: 'Reflection',
          },
          {
            id: 'reflection',
            type: 'paragraph',
            text: 'b'.repeat(200),
          },
        ],
      },
    })

    const contentPages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(contentPages).toHaveLength(2)
    expect(contentPages[0]?.blocks.map((block) => block.id)).toEqual(['intro'])
    expect(contentPages[1]?.blocks.map((block) => block.id)).toEqual(['heading', 'reflection'])
  })
})
