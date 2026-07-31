import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createPublicationFixture } from '../testing'
import {
  LEGACY_PUBLICATIONS_STORAGE_KEY,
  loadPublications,
  PUBLICATIONS_STORAGE_KEY,
  savePublications,
} from './publicationsStorage'

const publication = createPublicationFixture({
  title: 'Gentle Focus Journal',
  description: 'A supportive focus practice.',
  content: {
    blocks: [
      {
        id: 'heading-1',
        type: 'heading',
        level: 1,
        text: 'Gentle Focus',
      },
      {
        id: 'paragraph-1',
        type: 'paragraph',
        text: 'Begin with one small step.',
      },
    ],
  },
})

describe('publicationsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('returns an empty collection when storage is empty', () => {
    expect(loadPublications()).toEqual([])
  })

  it('loads a valid version 2 workspace', () => {
    localStorage.setItem(
      PUBLICATIONS_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        publications: [publication],
      }),
    )

    expect(loadPublications()).toEqual([publication])
  })

  it('migrates a version 1 workspace with empty content', () => {
    const legacyPublication = {
      id: publication.id,
      title: publication.title,
      description: publication.description,
      status: publication.status,
      createdAt: publication.createdAt,
      updatedAt: publication.updatedAt,
    }

    localStorage.setItem(
      LEGACY_PUBLICATIONS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        publications: [legacyPublication],
      }),
    )

    expect(loadPublications()).toEqual([
      {
        ...legacyPublication,
        content: {
          blocks: [],
        },
      },
    ])
  })

  it.each([
    ['invalid JSON', '{invalid-json'],
    [
      'unknown version',
      JSON.stringify({
        version: 3,
        publications: [publication],
      }),
    ],
    [
      'invalid collection',
      JSON.stringify({
        version: 2,
        publications: {},
      }),
    ],
    [
      'invalid publication content',
      JSON.stringify({
        version: 2,
        publications: [
          {
            ...publication,
            content: {
              blocks: [
                {
                  id: '',
                  type: 'paragraph',
                  text: 'Invalid block',
                },
              ],
            },
          },
        ],
      }),
    ],
  ])('falls back safely for %s', (_label, payload) => {
    localStorage.setItem(PUBLICATIONS_STORAGE_KEY, payload)

    expect(loadPublications()).toEqual([])
  })

  it('returns an empty collection when reading throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    expect(loadPublications()).toEqual([])
  })

  it('writes a version 2 workspace', () => {
    savePublications([publication])

    expect(JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '')).toEqual({
      version: 2,
      publications: [publication],
    })
  })

  it('does not throw when writing fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    expect(() => savePublications([publication])).not.toThrow()
  })
})
