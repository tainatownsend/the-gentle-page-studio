import { describe, expect, it } from 'vitest'

import { PUBLICATION_EDITORIAL_TOKENS } from './publicationEditorialTokens'

describe('PUBLICATION_EDITORIAL_TOKENS', () => {
  it('keeps the publication palette stable across renderers', () => {
    expect(PUBLICATION_EDITORIAL_TOKENS).toMatchObject({
      paper: '#FCFAF6',
      ink: '#2B302D',
      sage: '#7A9080',
      clay: '#B98575',
      sandSoft: '#F3EDDF',
    })
  })
})
