import { describe, expect, it } from 'vitest'

import { PUBLICATION_EDITORIAL_TOKENS } from './publicationEditorialTokens'

describe('publication editorial design system', () => {
  it('keeps the approved white-page Calm & Classic palette for publication rendering', () => {
    expect(PUBLICATION_EDITORIAL_TOKENS.paper).toBe('#FFFFFF')
    expect(PUBLICATION_EDITORIAL_TOKENS.sage).toBe('#6B7F72')
    expect(PUBLICATION_EDITORIAL_TOKENS.clay).toBe('#E2D3C7')
    expect(PUBLICATION_EDITORIAL_TOKENS.field).toBe('#FFFFFF')
  })
})
