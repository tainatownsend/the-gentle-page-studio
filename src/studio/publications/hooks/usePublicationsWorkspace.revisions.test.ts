import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PUBLICATION_REVISIONS_STORAGE_KEY } from '../persistence'
import { usePublicationsWorkspace } from './usePublicationsWorkspace'

const createdAt = '2026-08-21T05:00:00.000Z'
const publishedAt = '2026-08-21T05:30:00.000Z'
const restoredAt = '2026-08-21T06:00:00.000Z'

describe('usePublicationsWorkspace revisions', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(createdAt))
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('does not create a revision for ordinary draft saves', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Working journal',
      }).id
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Updated working journal',
        status: 'draft',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.revisions).toEqual([])
  })

  it('captures an immutable snapshot when a draft is explicitly published', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Gentle Focus Journal',
      }).id
    })

    vi.setSystemTime(new Date(publishedAt))

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Gentle Focus Journal v1',
        description: 'First published edition.',
        status: 'published',
        content: {
          blocks: [
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'Published content.',
            },
          ],
        },
      })
    })

    const revisions = result.current.getPublicationRevisions(publicationId)

    expect(revisions).toHaveLength(1)
    expect(revisions[0]).toMatchObject({
      id: expect.any(String),
      publicationId,
      title: 'Gentle Focus Journal v1',
      description: 'First published edition.',
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Published content.',
          },
        ],
      },
      publishedAt,
    })

    expect(revisions[0]?.content).not.toBe(result.current.publications[0]?.content)

    const persisted = JSON.parse(
      localStorage.getItem(PUBLICATION_REVISIONS_STORAGE_KEY) ?? '{}',
    )

    expect(persisted.version).toBe(1)
    expect(persisted.revisions).toHaveLength(1)
  })

  it('does not create another revision while saving an already published publication', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Release journal',
      }).id
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release journal',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release journal',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.getPublicationRevisions(publicationId)).toHaveLength(1)
  })

  it('creates another immutable revision after a published item returns to draft and is published again', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Release journal',
      }).id
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release journal v1',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release journal v2',
        status: 'draft',
        content: {
          blocks: [],
        },
      })
    })

    vi.setSystemTime(new Date(publishedAt))

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Release journal v2',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    expect(
      result.current.getPublicationRevisions(publicationId).map((revision) => revision.title),
    ).toEqual(['Release journal v2', 'Release journal v1'])
  })

  it('restores a historical revision as a new draft without removing history', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Published journal',
      }).id
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Published journal v1',
        status: 'published',
        content: {
          blocks: [
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'Historical content.',
            },
          ],
        },
      })
    })

    const revisionId = result.current.revisions[0]?.id ?? ''
    vi.setSystemTime(new Date(restoredAt))

    let restoredId = ''

    act(() => {
      restoredId = result.current.restorePublicationRevision(revisionId)?.id ?? ''
    })

    const restored = result.current.getPublication(restoredId)

    expect(restored).toMatchObject({
      title: 'Published journal v1',
      status: 'draft',
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Historical content.',
          },
        ],
      },
      createdAt: restoredAt,
      updatedAt: restoredAt,
    })
    expect(restoredId).not.toBe(publicationId)
    expect(result.current.revisions).toHaveLength(1)
  })

  it('removes associated history when a publication is permanently deleted', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())

    let publicationId = ''

    act(() => {
      publicationId = result.current.createDraft({
        title: 'Disposable journal',
      }).id
    })

    act(() => {
      result.current.updatePublication(publicationId, {
        title: 'Disposable journal',
        status: 'published',
        content: {
          blocks: [],
        },
      })
    })

    expect(result.current.revisions).toHaveLength(1)

    act(() => {
      result.current.deletePublication(publicationId)
    })

    expect(result.current.revisions).toEqual([])
  })
})
