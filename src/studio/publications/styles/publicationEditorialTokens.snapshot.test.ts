import { describe, expect, it } from 'vitest'

import { PUBLICATION_EDITORIAL_TOKENS } from './publicationEditorialTokens'

describe('publication editorial tokens snapshot', () => {
  it('contains only hex publication colors', () => {
    Object.values(PUBLICATION_EDITORIAL_TOKENS).forEach((value) => {
      expect(value).toMatch(/^#[0-9A-F]{6}$/)
    })
  })
})
