import { beforeEach, describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { loadPublications, savePublications } from './publicationsStorage'

describe('publication storage structured blocks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips table and rating blocks without losing semantic data', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'table-1',
            type: 'table',
            text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |',
          },
          {
            id: 'rating-1',
            type: 'rating-field',
            text: 'Energy right now',
            min: 0,
            max: 10,
          },
        ],
      },
    })

    savePublications([publication])

    expect(loadPublications()[0]?.content.blocks).toEqual(publication.content.blocks)
  })
})
