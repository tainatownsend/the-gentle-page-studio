import { describe, expect, it } from 'vitest'

import { createPublicationId } from './createPublicationId'

describe('createPublicationId', () => {
  it('creates a non-empty identifier', () => {
    expect(createPublicationId()).toEqual(expect.any(String))
    expect(createPublicationId().length).toBeGreaterThan(0)
  })

  it('creates distinct identifiers', () => {
    expect(createPublicationId()).not.toBe(createPublicationId())
  })
})
