import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearPublicationDraftRecovery,
  loadPublicationDraftRecovery,
  savePublicationDraftRecovery,
} from './publicationDraftRecovery'

const values = {
  title: 'Recovered journal',
  description: 'Unsaved work',
  status: 'draft' as const,
  content: {
    blocks: [{ id: 'block-1', type: 'paragraph' as const, text: 'Hello' }],
  },
}

describe('publicationDraftRecovery', () => {
  beforeEach(() => localStorage.clear())

  it('restores only when the saved publication version still matches', () => {
    savePublicationDraftRecovery('pub-1', 'version-1', values)

    expect(loadPublicationDraftRecovery('pub-1', 'version-1')).toEqual(values)
    expect(loadPublicationDraftRecovery('pub-1', 'version-2')).toBeUndefined()
  })

  it('replaces the prior recovery for the same publication', () => {
    savePublicationDraftRecovery('pub-1', 'version-1', values)
    savePublicationDraftRecovery('pub-1', 'version-1', { ...values, title: 'Newer' })

    expect(loadPublicationDraftRecovery('pub-1', 'version-1')?.title).toBe('Newer')
  })

  it('clears one publication without affecting another', () => {
    savePublicationDraftRecovery('pub-1', 'version-1', values)
    savePublicationDraftRecovery('pub-2', 'version-2', values)

    clearPublicationDraftRecovery('pub-1')

    expect(loadPublicationDraftRecovery('pub-1', 'version-1')).toBeUndefined()
    expect(loadPublicationDraftRecovery('pub-2', 'version-2')).toEqual(values)
  })
})
