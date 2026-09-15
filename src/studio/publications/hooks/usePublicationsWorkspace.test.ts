import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PUBLICATIONS_STORAGE_KEY } from '../persistence'
import {
  createDefaultPublicationDocumentSettings,
  type Publication,
} from '../types'
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

  it('hydrates publications from storage', () => {
    const publication: Publication = {
      id: 'stored-publication',
      title: 'Stored publication',
      status: 'draft',
      content: {
        blocks: [],
      },
      documentSettings: createDefaultPublicationDocumentSettings(),
      createdAt: initialTimestamp,
      updatedAt: initialTimestamp,
    }

    localStorage.setItem(
      PUBLICATIONS_STORAGE_KEY,
      JSON.stringify({
        version: 4,
        publications: [publication],
      }),
    )

    const { result } = renderHook(() => usePublicationsWorkspace())

    expect(result.current.publications).toEqual([publication])
    expect(result.current.getPublication('stored-publication')).toEqual(publication)
  })

  it('creates a durable draft with timestamps and document defaults', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let createdPublication: Publication | undefined

    act(() => {
      createdPublication = result.current.createDraft({
        title: 'Gentle Focus Journal',
        description: 'A supportive focus practice.',
      })
    })

    expect(result.current.publications).toHaveLength(1)
    expect(createdPublication).toMatchObject({
      id: expect.any(String),
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      status: 'draft',
      content: {
        blocks: [],
      },
      documentSettings: {
        pageSize: 'us-letter',
        orientation: 'portrait',
        margins: {
          top: 0.75,
          right: 0.75,
          bottom: 0.75,
          left: 0.75,
        },
      },
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

    expect(workspace.version).toBe(4)
    expect(workspace.publications).toHaveLength(1)
    expect(workspace.publications[0].title).toBe('Persistent publication')
    expect(workspace.publications[0].documentSettings.pageSize).toBe('us-letter')
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
      documentSettings: sourcePublication?.documentSettings,
      createdAt: duplicatedTimestamp,
      updatedAt: duplicatedTimestamp,
    })

    expect(duplicatedPublication?.id).not.toBe(sourcePublication?.id)
    expect(duplicatedPublication?.documentSettings).not.toBe(sourcePublication?.documentSettings)
    expect(duplicatedPublication?.documentSettings.margins).not.toBe(
      sourcePublication?.documentSettings.margins,
    )

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

  it('deletes an existing publication and persists the collection', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let firstId = ''
    let secondId = ''

    act(() => {
      firstId = result.current.createDraft({
        title: 'First publication',
      }).id

      secondId = result.current.createDraft({
        title: 'Second publication',
      }).id
    })

    act(() => {
      result.current.deletePublication(firstId)
    })

    expect(result.current.publications.map((publication) => publication.id)).toEqual([secondId])

    const persistedWorkspace = JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '{}')

    expect(
      persistedWorkspace.publications.map((publication: { id: string }) => publication.id),
    ).toEqual([secondId])
  })

  it('ignores deletion for an unknown publication', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    act(() => {
      result.current.deletePublication('missing')
    })

    expect(result.current.publications).toEqual([])
  })

  it('updates timestamps while preserving creation time and document settings', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Original title',
      }).id
    })

    const originalDocumentSettings = result.current.publications[0]?.documentSettings

    vi.setSystemTime(new Date(updatedTimestamp))

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Updated title',
        description: 'Updated description.',
        status: 'draft',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.publications[0]).toMatchObject({
      id: publicationId,
      title: 'Updated title',
      description: 'Updated description.',
      createdAt: initialTimestamp,
      updatedAt: updatedTimestamp,
      status: 'draft',
      documentSettings: originalDocumentSettings,
    })
  })

  it('updates publication status and persists the transition', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Release-ready journal',
      }).id
    })

    vi.setSystemTime(new Date(updatedTimestamp))

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release-ready journal',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.publications[0]).toMatchObject({
      id: publicationId,
      status: 'published',
      createdAt: initialTimestamp,
      updatedAt: updatedTimestamp,
    })

    const persistedWorkspace = JSON.parse(localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ?? '{}')

    expect(persistedWorkspace.publications[0].status).toBe('published')
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
        status: 'draft',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.publications[0]?.title).toBe('Existing publication')
  })
})
