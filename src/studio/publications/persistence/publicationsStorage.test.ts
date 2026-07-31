import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Publication } from '../types'
import { loadPublications, PUBLICATIONS_STORAGE_KEY, savePublications } from './publicationsStorage'

const publication: Publication = {
  id: 'publication-1',
  title: 'Gentle Focus Journal',
  description: 'A supportive focus practice.',
  status: 'draft',
  createdAt: '2026-07-30T22:47:00.000Z',
  updatedAt: '2026-07-30T22:47:00.000Z',
}

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

  it('loads a valid versioned workspace', () => {
    localStorage.setItem(
      PUBLICATIONS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        publications: [publication],
      }),
    )

    expect(loadPublications()).toEqual([publication])
  })

  it.each([
    ['invalid JSON', '{invalid-json'],
    [
      'unknown version',
      JSON.stringify({
        version: 2,
        publications: [publication],
      }),
    ],
    [
      'invalid collection',
      JSON.stringify({
        version: 1,
        publications: {},
      }),
    ],
    [
      'invalid publication',
      JSON.stringify({
        version: 1,
        publications: [{ ...publication, updatedAt: 'invalid' }],
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

  it('writes a versioned workspace', () => {
    savePublications([publication])

    expect(JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '')).toEqual({
      version: 1,
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
