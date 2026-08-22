import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDefaultPublicationDocumentSettings, type PublicationRevision } from '../types'
import {
  LEGACY_PUBLICATION_REVISIONS_STORAGE_KEY,
  loadPublicationRevisions,
  PUBLICATION_REVISIONS_STORAGE_KEY,
  savePublicationRevisions,
} from './publicationRevisionsStorage'

const revision: PublicationRevision = {
  id: 'revision-1',
  publicationId: 'publication-1',
  title: 'Published journal',
  description: 'Published description.',
  content: {
    blocks: [
      {
        id: 'paragraph-1',
        type: 'paragraph',
        text: 'Published content.',
      },
      {
        id: 'field-1',
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
  documentSettings: createDefaultPublicationDocumentSettings(),
  publishedAt: '2026-08-21T05:00:00.000Z',
}

describe('publicationRevisionsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns an empty collection when storage is empty', () => {
    expect(loadPublicationRevisions()).toEqual([])
  })

  it('persists and loads version 2 revisions with interactive blocks', () => {
    savePublicationRevisions([revision])

    expect(JSON.parse(localStorage.getItem(PUBLICATION_REVISIONS_STORAGE_KEY) ?? '')).toEqual({
      version: 2,
      revisions: [revision],
    })
    expect(loadPublicationRevisions()).toEqual([revision])
  })

  it('migrates version 1 revision history', () => {
    const legacyRevision = {
      ...revision,
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph' as const,
            text: 'Published content.',
          },
        ],
      },
    }

    localStorage.setItem(
      LEGACY_PUBLICATION_REVISIONS_STORAGE_KEY,
      JSON.stringify({ version: 1, revisions: [legacyRevision] }),
    )

    expect(loadPublicationRevisions()).toEqual([legacyRevision])
  })

  it.each([
    ['invalid JSON', '{invalid-json'],
    ['unknown version', JSON.stringify({ version: 3, revisions: [revision] })],
    ['invalid collection', JSON.stringify({ version: 2, revisions: {} })],
    [
      'invalid revision',
      JSON.stringify({
        version: 2,
        revisions: [
          {
            ...revision,
            publicationId: '',
          },
        ],
      }),
    ],
    [
      'invalid interactive field',
      JSON.stringify({
        version: 2,
        revisions: [
          {
            ...revision,
            content: {
              blocks: [{ id: 'field-1', type: 'checkbox-field' }],
            },
          },
        ],
      }),
    ],
  ])('falls back safely for %s', (_label, payload) => {
    localStorage.setItem(PUBLICATION_REVISIONS_STORAGE_KEY, payload)

    expect(loadPublicationRevisions()).toEqual([])
  })

  it('does not throw when writing fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    expect(() => savePublicationRevisions([revision])).not.toThrow()
  })
})
