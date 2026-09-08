import { describe, expect, it } from 'vitest'

import { PUBLICATION_EDITORIAL_TOKENS } from './publicationEditorialTokens'

describe('publication editorial design system', () => {
  it('keeps a warm paper / sage / clay palette for publication rendering', () => {
    expect(PUBLICATION_EDITORIAL_TOKENS.paper).toBe('#FCFAF6')
    expect(PUBLICATION_EDITORIAL_TOKENS.sage).toBe('#7A9080')
    expect(PUBLICATION_EDITORIAL_TOKENS.clay).toBe('#B98575')
    expect(PUBLICATION_EDITORIAL_TOKENS.field).toBe('#FAF7F1')
  })
})
