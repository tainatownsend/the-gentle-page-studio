import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { createPublicationPdfPlan } from './publicationPdfPlan'

describe('createPublicationPdfPlan structured fields', () => {
  it('creates a stable fillable rating field from the shared publication layout', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        id: 'energy-journal',
        content: {
          blocks: [
            {
              id: 'rating-energy',
              type: 'rating-field',
              text: 'Energy right now',
              min: 0,
              max: 4,
            },
          ],
        },
      }),
    )

    expect(plan.interactiveFields).toEqual([
      expect.objectContaining({
        name: 'publication.energy-journal.block.rating-energy',
        blockId: 'rating-energy',
        pageNumber: 1,
        kind: 'rating',
        label: 'Energy right now',
        options: ['0', '1', '2', '3', '4'],
      }),
    ])
  })
})
