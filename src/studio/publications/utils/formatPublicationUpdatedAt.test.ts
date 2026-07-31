import { describe, expect, it } from 'vitest'

import { formatPublicationUpdatedAt } from './formatPublicationUpdatedAt'

describe('formatPublicationUpdatedAt', () => {
  it('formats a publication timestamp', () => {
    expect(formatPublicationUpdatedAt('2026-07-30T22:47:00.000Z')).toBe('Jul 30, 2026')
  })

  it('returns an invalid value unchanged', () => {
    expect(formatPublicationUpdatedAt('invalid-date')).toBe('invalid-date')
  })
})
