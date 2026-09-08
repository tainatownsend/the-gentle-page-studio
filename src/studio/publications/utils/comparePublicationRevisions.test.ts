import { describe, expect, it } from 'vitest'

import {
  createDefaultPublicationDocumentSettings,
  type PublicationRevision,
} from '../types'
import { comparePublicationRevisions } from './comparePublicationRevisions'

function createRevision(
  overrides: Partial<PublicationRevision> = {},
): PublicationRevision {
  return {
    id: 'revision-1',
    publicationId: 'publication-1',
    title: 'Gentle Focus Journal',
    description: 'A supportive focus practice.',
    content: {
      blocks: [
        {
          id: 'heading-1',
          type: 'heading',
          level: 1,
          text: 'Pause and notice',
        },
        {
          id: 'paragraph-1',
          type: 'paragraph',
          text: 'What feels most present right now?',
        },
      ],
    },
    documentSettings: createDefaultPublicationDocumentSettings(),
    publishedAt: '2026-08-21T12:00:00.000Z',
    ...overrides,
  }
}

describe('comparePublicationRevisions', () => {
  it('reports no changes for equivalent snapshots', () => {
    const from = createRevision()
    const to = createRevision({ id: 'revision-2' })

    expect(comparePublicationRevisions(from, to)).toEqual({
      fromRevisionId: 'revision-1',
      toRevisionId: 'revision-2',
      hasChanges: false,
      changes: [],
    })
  })

  it('reports metadata changes', () => {
    const comparison = comparePublicationRevisions(
      createRevision(),
      createRevision({
        id: 'revision-2',
        title: 'Updated Journal',
        description: undefined,
      }),
    )

    expect(comparison.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'metadata', field: 'title' }),
        expect.objectContaining({ kind: 'metadata', field: 'description' }),
      ]),
    )
  })

  it('reports added, removed, changed, and moved blocks by durable block id', () => {
    const from = createRevision()
    const to = createRevision({
      id: 'revision-2',
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Updated reflection prompt.',
          },
          {
            id: 'checkbox-1',
            type: 'checkbox-field',
            text: 'I completed this reflection.',
          },
        ],
      },
    })

    const comparison = comparePublicationRevisions(from, to)

    expect(comparison.hasChanges).toBe(true)
    expect(comparison.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'block-removed',
          blockId: 'heading-1',
        }),
        expect.objectContaining({
          kind: 'block-changed',
          blockId: 'paragraph-1',
        }),
        expect.objectContaining({
          kind: 'block-moved',
          blockId: 'paragraph-1',
          beforeIndex: 1,
          afterIndex: 0,
        }),
        expect.objectContaining({
          kind: 'block-added',
          blockId: 'checkbox-1',
        }),
      ]),
    )
  })
})
