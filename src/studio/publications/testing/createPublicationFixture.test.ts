import { describe, expect, it } from 'vitest'

import { createPublicationFixture, DEFAULT_PUBLICATION_TIMESTAMP } from './createPublicationFixture'

describe('createPublicationFixture', () => {
  it('creates a complete publication with stable defaults', () => {
    expect(createPublicationFixture()).toEqual({
      id: 'publication-1',
      title: 'Untitled publication',
      status: 'draft',
      content: {
        blocks: [],
      },
      createdAt: DEFAULT_PUBLICATION_TIMESTAMP,
      updatedAt: DEFAULT_PUBLICATION_TIMESTAMP,
    })
  })

  it('supports focused overrides', () => {
    expect(
      createPublicationFixture({
        id: 'published-publication',
        title: 'Published journal',
        description: 'Ready for release.',
        status: 'published',
        content: {
          blocks: [
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'Ready.',
            },
          ],
        },
      }),
    ).toEqual({
      id: 'published-publication',
      title: 'Published journal',
      description: 'Ready for release.',
      status: 'published',
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Ready.',
          },
        ],
      },
      createdAt: DEFAULT_PUBLICATION_TIMESTAMP,
      updatedAt: DEFAULT_PUBLICATION_TIMESTAMP,
    })
  })
})
