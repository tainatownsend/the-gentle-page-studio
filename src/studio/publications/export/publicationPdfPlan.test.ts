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

  it('projects interactive fields into stable identities and mobile-friendly coordinates', () => {
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
        x: 68,
        width: 476,
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
        width: 18,
        height: 18,
      },
    })
  })

  it('plans a rating scale as one stable radio group with tappable controls', () => {
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
      expect(ratingField.options.every((option) => option.rect.width === 16)).toBe(true)
      expect(ratingField.options.every((option) => option.rect.height === 16)).toBe(true)
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

  it('preserves field identities while editorial recomposition rebalances page assignment', () => {
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

    expect(plan.interactiveFields.map((field) => field.blockId)).toEqual([
      'response-1',
      'response-2',
      'response-3',
      'response-4',
    ])
    expect(plan.interactiveFields.map((field) => field.pageNumber)).toEqual([1, 1, 2, 2])
  })

  it('carries page template intent into the PDF plan', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'emergency-heading',
              type: 'heading',
              level: 2,
              text: 'Emergency Unfreeze Protocol',
              layout: {
                pageTemplate: 'emergency-tool',
              },
            },
            {
              id: 'emergency-body',
              type: 'paragraph',
              text: 'Start with one small reset.',
            },
          ],
        },
      }),
    )

    expect(plan.pages.find((page) => page.kind === 'content')).toMatchObject({
      pageTemplate: 'emergency-tool',
    })
  })


  it('places guided framework states in a two-by-two PDF grid', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'states-heading',
              type: 'heading',
              level: 2,
              text: 'The 4-State Self-Scan',
              layout: { pageTemplate: 'guided-framework' },
            },
            { id: 'state-1', type: 'checkbox-field', text: 'Hyperarousal' },
            { id: 'state-2', type: 'checkbox-field', text: 'Hypoarousal' },
            { id: 'state-3', type: 'checkbox-field', text: 'Underaroused' },
            { id: 'state-4', type: 'checkbox-field', text: 'Regulated Window' },
            {
              id: 'state-note',
              type: 'multiline-text-field',
              text: 'What is your body physically feeling right now?',
              responseSize: 'medium',
            },
          ],
        },
      }),
    )

    const page = plan.pages.find(
      (candidate) => candidate.pageTemplate === 'guided-framework',
    )
    const statePlacements =
      page?.blockPlacements.filter((placement) => placement.type === 'checkbox-field') ?? []

    expect(statePlacements).toHaveLength(4)
    expect(new Set(statePlacements.map((placement) => placement.rect.x)).size).toBe(2)
    expect(new Set(statePlacements.map((placement) => placement.rect.y)).size).toBe(2)
    expect(
      statePlacements.every(
        (placement) => placement.rect.width < PUBLICATION_CONTENT_WIDTH_POINTS,
      ),
    ).toBe(true)
    expect(
      statePlacements.every(
        (placement) =>
          placement.rect.x >= PUBLICATION_MARGIN_POINTS &&
          placement.rect.x + placement.rect.width <=
            US_LETTER_WIDTH_POINTS - PUBLICATION_MARGIN_POINTS,
      ),
    ).toBe(true)
  })


  it('places the six daily regulation tools in a three-by-two PDF grid', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'tools-heading',
              type: 'heading',
              level: 2,
              text: 'Daily Regulation Tools',
              layout: { pageTemplate: 'tool-overview' },
            },
            { id: 'breathe', type: 'heading', level: 3, text: 'Breathe' },
            { id: 'breathe-copy', type: 'paragraph', text: 'Reset your body in 2 minutes.' },
            { id: 'move', type: 'heading', level: 3, text: 'Move' },
            { id: 'move-copy', type: 'paragraph', text: 'Release tension gently.' },
            { id: 'ground', type: 'heading', level: 3, text: 'Ground' },
            { id: 'ground-copy', type: 'paragraph', text: 'Come back to the present.' },
            { id: 'soothe', type: 'heading', level: 3, text: 'Soothe' },
            { id: 'soothe-copy', type: 'paragraph', text: 'Calm your senses.' },
            { id: 'refocus', type: 'heading', level: 3, text: 'Refocus' },
            { id: 'refocus-copy', type: 'paragraph', text: 'Bring back attention.' },
            { id: 'connect', type: 'heading', level: 3, text: 'Connect' },
            { id: 'connect-copy', type: 'paragraph', text: 'Feel supported and less alone.' },
          ],
        },
      }),
    )

    const page = plan.pages.find((candidate) => candidate.pageTemplate === 'tool-overview')
    const headingPlacements =
      page?.blocks
        .map((block, index) => ({ block, placement: page.blockPlacements[index] }))
        .filter(
          ({ block, placement }) =>
            block.type === 'heading' && block.level === 3 && placement,
        )
        .map(({ placement }) => placement) ?? []

    expect(headingPlacements).toHaveLength(6)
    expect(new Set(headingPlacements.map((placement) => placement?.rect.x)).size).toBe(3)
    expect(new Set(headingPlacements.map((placement) => placement?.rect.y)).size).toBe(2)
  })

  it('keeps the sensory reset guide and writing field on one fillable PDF page', () => {
    const plan = createPublicationPdfPlan(
      createPublicationFixture({
        id: 'sensory-reset-journal',
        content: {
          blocks: [
            {
              id: 'sensory-heading',
              type: 'heading',
              level: 2,
              text: 'Sensory Reset',
              layout: { pageTemplate: 'sensory-reset' },
            },
            { id: 'sight', type: 'heading', level: 3, text: 'Sight' },
            { id: 'sight-copy', type: 'paragraph', text: 'Look at something calming.' },
            { id: 'sound', type: 'heading', level: 3, text: 'Sound' },
            { id: 'sound-copy', type: 'paragraph', text: 'Listen to a grounding sound.' },
            { id: 'touch', type: 'heading', level: 3, text: 'Touch' },
            { id: 'touch-copy', type: 'paragraph', text: 'Hold something soothing.' },
            { id: 'smell', type: 'heading', level: 3, text: 'Smell' },
            { id: 'smell-copy', type: 'paragraph', text: 'Use a calming scent.' },
            { id: 'taste', type: 'heading', level: 3, text: 'Taste' },
            { id: 'taste-copy', type: 'paragraph', text: 'Have a sip of water or tea.' },
            {
              id: 'sensory-notes',
              type: 'multiline-text-field',
              text: 'My go-to sensory tools',
              responseSize: 'medium',
            },
          ],
        },
      }),
    )

    const sensoryPages = plan.pages.filter(
      (candidate) => candidate.pageTemplate === 'sensory-reset',
    )

    expect(sensoryPages).toHaveLength(1)
    expect(
      plan.interactiveFields.find((field) => field.blockId === 'sensory-notes'),
    ).toMatchObject({
      pageNumber: sensoryPages[0]?.pageNumber,
      kind: 'multiline-text',
    })
  })

})
