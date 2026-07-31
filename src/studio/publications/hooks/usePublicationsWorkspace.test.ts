import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PUBLICATIONS_STORAGE_KEY } from '../persistence'
import type { Publication } from '../types'
import { usePublicationsWorkspace } from './usePublicationsWorkspace'

const initialTimestamp = '2026-07-30T22:47:00.000Z'
const duplicatedTimestamp = '2026-07-30T23:00:00.000Z'
const updatedTimestamp = '2026-07-30T23:15:00.000Z'

describe('usePublicationsWorkspace', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(initialTimestamp))
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('controls the publication creation state', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    expect(result.current.isCreating).toBe(false)

    act(() => {
      result.current.startCreating()
    })

    expect(result.current.isCreating).toBe(true)

    act(() => {
      result.current.cancelCreating()
    })

    expect(result.current.isCreating).toBe(false)
  })

  it('hydrates publications from storage', () => {
    const publication: Publication = {
      id: 'stored-publication',
      title: 'Stored publication',
      status: 'draft',
      createdAt: initialTimestamp,
      updatedAt: initialTimestamp,
    }

    localStorage.setItem(
      PUBLICATIONS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        publications: [publication],
      }),
    )

    const { result } = renderHook(() => usePublicationsWorkspace())

    expect(result.current.publications).toEqual([publication])
    expect(result.current.getPublication('stored-publication')).toEqual(publication)
  })

  it('creates a durable draft with timestamps', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let createdPublication: Publication | undefined

    act(() => {
      result.current.startCreating()
      createdPublication = result.current.createDraft({
        title: 'Gentle Focus Journal',
        description: 'A supportive focus practice.',
      })
    })

    expect(result.current.isCreating).toBe(false)
    expect(result.current.publications).toHaveLength(1)
    expect(createdPublication).toMatchObject({
      id: expect.any(String),
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      status: 'draft',
      createdAt: initialTimestamp,
      updatedAt: initialTimestamp,
    })
  })

  it('persists publications after creation', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    act(() => {
      result.current.createDraft({
        title: 'Persistent publication',
      })
    })

    const workspace = JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '{}')

    expect(workspace.version).toBe(1)
    expect(workspace.publications).toHaveLength(1)
    expect(workspace.publications[0].title).toBe('Persistent publication')
  })

  it('duplicates a publication as a new persisted draft', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let sourcePublication: Publication | undefined

    act(() => {
      sourcePublication = result.current.createDraft({
        title: 'Gentle Focus Journal',
        description: 'A supportive focus practice.',
      })
    })

    vi.setSystemTime(new Date(duplicatedTimestamp))

    let duplicatedPublication: Publication | undefined

    act(() => {
      duplicatedPublication = result.current.duplicatePublication(sourcePublication?.id ?? '')
    })

    expect(result.current.publications).toHaveLength(2)
    expect(result.current.publications[0]).toEqual(duplicatedPublication)

    expect(duplicatedPublication).toMatchObject({
      id: expect.any(String),
      title: 'Gentle Focus Journal — Copy',
      description: 'A supportive focus practice.',
      status: 'draft',
      createdAt: duplicatedTimestamp,
      updatedAt: duplicatedTimestamp,
    })

    expect(duplicatedPublication?.id).not.toBe(sourcePublication?.id)

    const workspace = JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '{}')

    expect(workspace.publications[0]).toEqual(duplicatedPublication)
  })

  it('numbers subsequent copies without stacking copy suffixes', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let originalId = ''
    let secondCopyId = ''

    act(() => {
      originalId = result.current.createDraft({
        title: 'Gentle Focus Journal',
      }).id
    })

    act(() => {
      result.current.duplicatePublication(originalId)
    })

    act(() => {
      secondCopyId = result.current.duplicatePublication(originalId)?.id ?? ''
    })

    act(() => {
      result.current.duplicatePublication(secondCopyId)
    })

    expect(result.current.publications.map((publication) => publication.title)).toEqual([
      'Gentle Focus Journal — Copy 3',
      'Gentle Focus Journal — Copy 2',
      'Gentle Focus Journal — Copy',
      'Gentle Focus Journal',
    ])
  })

  it('returns undefined when duplicating an unknown publication', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let duplicatedPublication: Publication | undefined

    act(() => {
      duplicatedPublication = result.current.duplicatePublication('missing')
    })

    expect(duplicatedPublication).toBeUndefined()
    expect(result.current.publications).toEqual([])
  })

  it('updates timestamps while preserving creation time', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Original title',
      }).id
    })

    vi.setSystemTime(new Date(updatedTimestamp))

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Updated title',
        description: 'Updated description.',
      })
    })

    expect(result.current.publications[0]).toMatchObject({
      id: publicationId,
      title: 'Updated title',
      description: 'Updated description.',
      createdAt: initialTimestamp,
      updatedAt: updatedTimestamp,
      status: 'draft',
    })
  })

  it('ignores updates for unknown publication ids', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    act(() => {
      result.current.createDraft({
        title: 'Existing publication',
      })
    })

    act(() => {
      result.current.updatePublication('missing', {
        title: 'Should not replace',
      })
    })

    expect(result.current.publications[0]?.title).toBe('Existing publication')
  })
})
