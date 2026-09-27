import { describe, expect, it } from 'vitest'

import { PUBLICATION_EDITORIAL_TOKENS } from './publicationEditorialTokens'

describe('PUBLICATION_EDITORIAL_TOKENS', () => {
  it('keeps the publication palette stable across renderers', () => {
    expect(PUBLICATION_EDITORIAL_TOKENS).toMatchObject({
      paper: '#FFFFFF',
      ink: '#2F3A36',
      sage: '#6B7F72',
      clay: '#E2D3C7',
      sandSoft: '#F7F4EF',
    })
  })
})
