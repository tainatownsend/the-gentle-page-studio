import { beforeEach, describe, expect, it } from 'vitest'

import {
  createDefaultPublicationDocumentSettings,
  type PublicationRevision,
} from '../types'
import {
  loadPublicationRevisions,
  savePublicationRevisions,
} from './publicationRevisionsStorage'

describe('publication revision storage structured blocks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips structured blocks in immutable publication history', () => {
    const revision: PublicationRevision = {
      id: 'revision-structured',
      publicationId: 'publication-structured',
      title: 'Energy Audit',
      content: {
        blocks: [
          {
            id: 'table-1',
            type: 'table',
            text: '| Time | Before | After |\n| --- | --- | --- |\n| Morning | 4 | 6 |',
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
      documentSettings: createDefaultPublicationDocumentSettings(),
      publishedAt: '2026-08-29T12:00:00.000Z',
    }

    savePublicationRevisions([revision])

    expect(loadPublicationRevisions()).toEqual([revision])
  })
})
