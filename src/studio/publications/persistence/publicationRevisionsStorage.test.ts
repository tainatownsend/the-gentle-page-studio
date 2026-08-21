import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDefaultPublicationDocumentSettings, type PublicationRevision } from '../types'
import {
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

  it('persists and loads valid revisions', () => {
    savePublicationRevisions([revision])

    expect(JSON.parse(localStorage.getItem(PUBLICATION_REVISIONS_STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      revisions: [revision],
    })
    expect(loadPublicationRevisions()).toEqual([revision])
  })

  it.each([
    ['invalid JSON', '{invalid-json'],
    ['unknown version', JSON.stringify({ version: 2, revisions: [revision] })],
    ['invalid collection', JSON.stringify({ version: 1, revisions: {} })],
    [
      'invalid revision',
      JSON.stringify({
        version: 1,
        revisions: [
          {
            ...revision,
            publicationId: '',
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
