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

  it('uses sparse-page capacity before splitting a long checklist across pages', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'heading',
            type: 'heading',
            level: 2,
            text: 'Permission Slips',
          },
          {
            id: 'intro',
            type: 'paragraph',
            text: 'Choose only the permissions that reduce pressure today.',
          },
          ...Array.from({ length: 7 }, (_, index) => ({
            id: `check-${index + 1}`,
            type: 'checkbox-field' as const,
            text: `Permission option ${index + 1}`,
          })),
        ],
      },
    })

    const pages = createPublicationLayout(publication).pages.filter(
      (page) => page.kind === 'content',
    )

    expect(pages).toHaveLength(2)
    expect(pages[0]?.blocks.map((block) => block.id)).toEqual(
      expect.arrayContaining(['heading', 'intro', 'check-1']),
    )
    expect(pages[0]?.blocks.at(-1)?.type).toBe('checkbox-field')
    expect(pages[1]?.blocks[0]?.type).toBe('checkbox-field')
    expect(pages.flatMap((page) => page.blocks).map((block) => block.id)).toEqual([
      'heading',
      'intro',
      'check-1',
      'check-2',
      'check-3',
      'check-4',
      'check-5',
      'check-6',
      'check-7',
    ])
  })
})
