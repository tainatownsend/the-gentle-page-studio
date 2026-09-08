import { describe, expect, it } from 'vitest'

import themeStyles from './PublicationDocumentTheme.module.css'

describe('PublicationDocumentTheme', () => {
  it('exports the publication theme class used by preview and print rendering', () => {
    expect(themeStyles.theme).toBeTruthy()
  })
})
