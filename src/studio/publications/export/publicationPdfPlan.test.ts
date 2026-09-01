import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import {
  createPublicationPdfPlan,
  PUBLICATION_CONTENT_HEIGHT_POINTS,
  PUBLICATION_CONTENT_WIDTH_POINTS,
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
    expect(PUBLICATION_CONTENT_WIDTH_POINTS).toBe(504)
    expect(PUBLICATION_CONTENT_HEIGHT_POINTS).toBe(660)
    expect(plan.pages[0]).toMatchObject({
      kind: 'cover',
      width: 612,
      height: 792,
      margin: 54,
    })
  })

  it('projects interactive fields into stable identities and coordinates', () => {
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

    const responseField = plan.interactiveFields[0]
    expect(responseField).toMatchObject({
      name: 'publication.journal-1.block.response-1',
      blockId: 'response-1',
      pageNumber: 1,
      kind: 'multiline-text',
      label: 'What would support you today?',
      rect: {
        x: 54,
        width: 504,
      },
    })
    expect(responseField?.kind).toBe('multiline-text')
    if (responseField?.kind === 'multiline-text') {
      expect(responseField.rect.height).toBeGreaterThan(72)
    }

    expect(plan.interactiveFields[1]).toMatchObject({
      name: 'publication.journal-1.block.checkbox-1',
      blockId: 'checkbox-1',
      pageNumber: 1,
      kind: 'checkbox',
      label: 'I completed this reflection.',
      rect: {
        x: 54,
        width: 14,
        height: 14,
      },
    })
  })

  it('plans a rating scale as one stable radio group', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        id: 'journal-rating',
        content: {
          blocks: [
            {
              id: 'energy-rating',
              type: 'rating-field',
              text: 'Energy right now',
              min: 0,
              max: 10,
            },
          ],
        },
      }),
    )

    const ratingField = plan.interactiveFields[0]
    expect(ratingField).toMatchObject({
      name: 'publication.journal-rating.block.energy-rating',
      blockId: 'energy-rating',
      pageNumber: 1,
      kind: 'rating',
      label: 'Energy right now',
    })
    expect(ratingField?.kind).toBe('rating')
    if (ratingField?.kind === 'rating') {
      expect(ratingField.options.map((option) => option.value)).toEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
      ])
      expect(ratingField.options.every((option) => option.rect.width === 12)).toBe(true)
    }
  })

  it('keeps block placements inside the printable content area', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'heading-1',
              type: 'heading',
              level: 1,
              text: 'Reflection',
            },
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'Begin with one small step.',
            },
          ],
        },
      }),
    )

    const page = plan.pages.find((candidate) => candidate.kind === 'content')

    for (const placement of page?.blockPlacements ?? []) {
      expect(placement.rect.x).toBe(54)
      expect(placement.rect.width).toBe(504)
      expect(placement.rect.y).toBeGreaterThanOrEqual(78)
      expect(placement.rect.y + placement.rect.height).toBeLessThanOrEqual(738)
    }
  })

  it('preserves field page assignment after automatic pagination', () => {
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
            {
              id: 'response-4',
              type: 'multiline-text-field',
              text: 'Fourth response',
            },
          ],
        },
      }),
    )

    expect(plan.interactiveFields.map((field) => field.pageNumber)).toEqual([1, 1, 1, 2])
  })
})
