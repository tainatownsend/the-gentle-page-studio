import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import {
  createFillablePdfExportPlan,
  createFillablePdfFieldName,
} from './fillablePdfExportPlan'

describe('fillable PDF export plan', () => {
  it('creates stable field names from publication and block ids', () => {
    expect(createFillablePdfFieldName('journal 1', 'response/1')).toBe(
      'publication.journal_1.block.response_1',
    )
  })

  it('maps only interactive blocks while preserving page and block position', () => {
    const publication = createPublicationFixture({
      id: 'journal-1',
      content: {
        blocks: [
          {
            id: 'heading-1',
            type: 'heading',
            level: 1,
            text: 'Reflect',
          },
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
    })

    const plan = createFillablePdfExportPlan(publication)

    expect(plan.publicationId).toBe('journal-1')
    expect(plan.fields).toEqual([
      {
        name: 'publication.journal-1.block.response-1',
        kind: 'multiline-text',
        publicationId: 'journal-1',
        blockId: 'response-1',
        prompt: 'What would support you today?',
        layoutPageSequence: 2,
        contentPageNumber: 1,
        blockIndexOnPage: 1,
      },
      {
        name: 'publication.journal-1.block.checkbox-1',
        kind: 'checkbox',
        publicationId: 'journal-1',
        blockId: 'checkbox-1',
        prompt: 'I completed this reflection.',
        layoutPageSequence: 2,
        contentPageNumber: 1,
        blockIndexOnPage: 2,
      },
    ])
  })

  it('keeps field identity stable when prompt text changes', () => {
    const first = createPublicationFixture({
      id: 'journal-1',
      content: {
        blocks: [
          {
            id: 'response-1',
            type: 'multiline-text-field',
            text: 'First prompt',
          },
        ],
      },
    })

    const second = createPublicationFixture({
      id: 'journal-1',
      content: {
        blocks: [
          {
            id: 'response-1',
            type: 'multiline-text-field',
            text: 'Updated prompt',
          },
        ],
      },
    })

    expect(createFillablePdfExportPlan(first).fields[0]?.name).toBe(
      createFillablePdfExportPlan(second).fields[0]?.name,
    )
  })

  it('creates no fields for static-only publications', () => {
    const plan = createFillablePdfExportPlan(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'Static content',
            },
          ],
        },
      }),
    )

    expect(plan.fields).toEqual([])
    expect(plan.pages).toHaveLength(1)
  })
})
