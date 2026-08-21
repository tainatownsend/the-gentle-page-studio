import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import {
  createPublicationPdfPlan,
  PUBLICATION_MARGIN_POINTS,
  US_LETTER_HEIGHT_POINTS,
  US_LETTER_WIDTH_POINTS,
} from './publicationPdfPlan'

describe('createPublicationPdfPlan', () => {
  it('uses exact US Letter point geometry and Gentle Page margins', () => {
    const plan = createPublicationPdfPlan(createPublicationFixture())

    expect(US_LETTER_WIDTH_POINTS).toBe(612)
    expect(US_LETTER_HEIGHT_POINTS).toBe(792)
    expect(PUBLICATION_MARGIN_POINTS).toBe(54)
    expect(plan.pages[0]).toMatchObject({
      kind: 'cover',
      width: 612,
      height: 792,
      margin: 54,
    })
  })

  it('projects interactive blocks into stable field identities', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        id: 'journal-1',
        content: {
          blocks: [
            {
              id: 'response-1',
              type: 'multiline-text-field',
              text: 'What would support you today?',
            },
            {
              id: 'checkbox-1',
              type: 'checkbox-field',
              text: 'I completed this reflection.',
            },
          ],
        },
      }),
    )

    expect(plan.interactiveFields).toEqual([
      {
        name: 'publication.journal-1.block.response-1',
        blockId: 'response-1',
        pageNumber: 1,
        kind: 'multiline-text',
        label: 'What would support you today?',
      },
      {
        name: 'publication.journal-1.block.checkbox-1',
        blockId: 'checkbox-1',
        pageNumber: 1,
        kind: 'checkbox',
        label: 'I completed this reflection.',
      },
    ])
  })

  it('preserves derived page assignment for fields after pagination', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        id: 'journal-2',
        content: {
          blocks: [
            {
              id: 'response-1',
              type: 'multiline-text-field',
              text: 'First response',
            },
            {
              id: 'response-2',
              type: 'multiline-text-field',
              text: 'Second response',
            },
            {
              id: 'response-3',
              type: 'multiline-text-field',
              text: 'Third response',
            },
          ],
        },
      }),
    )

    expect(plan.interactiveFields.map((field) => field.pageNumber)).toEqual([1, 1, 2])
  })
})
