import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationLayout } from './publicationLayout'

const repeatableGroup = {
  id: 'daily-check-in',
  kind: 'repeatable-page' as const,
  name: 'Daily Check-in',
}

describe('repeatable page layout', () => {
  it('isolates a repeatable group from content before and after it', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          { id: 'intro', type: 'paragraph', text: 'Introduction.' },
          {
            id: 'heading',
            type: 'heading',
            level: 2,
            text: 'Daily Check-in',
            semanticGroup: repeatableGroup,
          },
          {
            id: 'rating',
            type: 'rating-field',
            text: 'Energy right now',
            min: 0,
            max: 10,
            semanticGroup: repeatableGroup,
          },
          {
            id: 'response',
            type: 'multiline-text-field',
            text: 'What would support me today?',
            responseSize: 'medium',
            semanticGroup: repeatableGroup,
          },
          { id: 'closing', type: 'paragraph', text: 'Closing notes.' },
        ],
      },
    })

    const pages = createPublicationLayout(publication).pages.filter((page) => page.kind === 'content')

    expect(pages.map((page) => page.blocks.map((block) => block.id))).toEqual([
      ['intro'],
      ['heading', 'rating', 'response'],
      ['closing'],
    ])
    expect(pages[1]?.diagnostics).toBeUndefined()
  })

  it('does not report an intentionally spacious repeatable page as sparse', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'heading',
            type: 'heading',
            level: 2,
            text: 'Daily Check-in',
            semanticGroup: repeatableGroup,
          },
          {
            id: 'response',
            type: 'multiline-text-field',
            text: 'One gentle reflection',
            responseSize: 'short',
            semanticGroup: repeatableGroup,
          },
          { id: 'after', type: 'paragraph', text: 'After the repeatable page.' },
        ],
      },
    })

    const layout = createPublicationLayout(publication)

    expect(layout.diagnostics.some((diagnostic) => diagnostic.code === 'sparse-page')).toBe(false)
  })

  it('reports a repeatable group that exceeds one page without dropping content', () => {
    const blocks = Array.from({ length: 5 }, (_, index) => ({
      id: `response-${index}`,
      type: 'multiline-text-field' as const,
      text: `Long reflection ${index + 1}`,
      responseSize: 'long' as const,
      semanticGroup: repeatableGroup,
    }))

    const layout = createPublicationLayout(
      createPublicationFixture({
        content: { blocks },
      }),
    )

    expect(layout.pages.filter((page) => page.kind === 'content').length).toBeGreaterThan(1)
    expect(layout.pages.flatMap((page) => page.blocks).map((block) => block.id)).toEqual(
      blocks.map((block) => block.id),
    )
    expect(layout.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'repeatable-group-overflow',
          semanticGroupId: 'daily-check-in',
        }),
      ]),
    )
  })
})
