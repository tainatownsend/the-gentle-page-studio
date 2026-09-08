import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { usePublicationsWorkspace } from './usePublicationsWorkspace'

describe('usePublicationsWorkspace compiled creation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('creates a draft from compiled content instead of a manual template', () => {
    const { result } = renderHook(() => usePublicationsWorkspace())
    const compiledContent = {
      blocks: [
        {
          id: 'section-1',
          type: 'heading' as const,
          level: 2 as const,
          text: 'Begin here',
          layout: {
            pageBreakBefore: 'preferred' as const,
            keepWithNext: true,
          },
        },
        {
          id: 'response-1',
          type: 'multiline-text-field' as const,
          text: 'What do I need today?',
          responseSize: 'long' as const,
        },
      ],
    }

    let createdId = ''

    act(() => {
      createdId = result.current.createDraft({
        title: 'Compiled Journal',
        creationMode: 'compiled',
        content: compiledContent,
      }).id
    })

    const created = result.current.getPublication(createdId)

    expect(created?.content).toEqual(compiledContent)
    expect(created?.content).not.toBe(compiledContent)
    expect(created?.content.blocks).not.toBe(compiledContent.blocks)
    expect(created?.content.blocks[0]).not.toBe(compiledContent.blocks[0])
    expect(created?.content.blocks[0]?.layout).not.toBe(compiledContent.blocks[0]?.layout)
  })
})
