import { act, renderHook } from '@testing-library/react'

import { usePublicationsWorkspace } from './usePublicationsWorkspace'

describe('usePublicationsWorkspace', () => {
  it('controls the publication creation state', () => {
    const { result } = renderHook(() =>
      usePublicationsWorkspace(),
    )

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

  it('creates and retrieves a draft publication', () => {
    const { result } = renderHook(() =>
      usePublicationsWorkspace(),
    )

    act(() => {
      result.current.startCreating()
    })

    act(() => {
      result.current.createDraft({
        title: 'Gentle Focus Journal',
        description: 'A supportive focus practice.',
      })
    })

    expect(result.current.isCreating).toBe(false)
    expect(result.current.publications).toHaveLength(1)

    const publication = result.current.publications[0]

    expect(publication).toEqual({
      id: 'publication-1',
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      updatedAt: 'Just now',
      status: 'draft',
    })

    expect(
      result.current.getPublication('publication-1'),
    ).toEqual(publication)
  })

  it('updates an existing publication', () => {
    const { result } = renderHook(() =>
      usePublicationsWorkspace(),
    )

    act(() => {
      result.current.createDraft({
        title: 'Original title',
      })
    })

    act(() => {
      result.current.updatePublication('publication-1', {
        title: 'Updated title',
        description: 'Updated description.',
      })
    })

    expect(result.current.publications[0]).toEqual({
      id: 'publication-1',
      title: 'Updated title',
      description: 'Updated description.',
      updatedAt: 'Just now',
      status: 'draft',
    })
  })

  it('ignores updates for unknown publication ids', () => {
    const { result } = renderHook(() =>
      usePublicationsWorkspace(),
    )

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

    expect(result.current.publications[0]?.title).toBe(
      'Existing publication',
    )
  })
})
