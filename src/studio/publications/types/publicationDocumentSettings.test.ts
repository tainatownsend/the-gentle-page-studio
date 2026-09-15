import { describe, expect, it } from 'vitest'

import {
  createDefaultPublicationDocumentSettings,
  DEFAULT_PUBLICATION_MARGIN_INCHES,
} from './publicationDocumentSettings'

describe('publicationDocumentSettings', () => {
  it('creates the fixed Gentle Page MVP document defaults', () => {
    expect(createDefaultPublicationDocumentSettings()).toEqual({
      pageSize: 'us-letter',
      orientation: 'portrait',
      margins: {
        top: DEFAULT_PUBLICATION_MARGIN_INCHES,
        right: DEFAULT_PUBLICATION_MARGIN_INCHES,
        bottom: DEFAULT_PUBLICATION_MARGIN_INCHES,
        left: DEFAULT_PUBLICATION_MARGIN_INCHES,
      },
    })
  })

  it('returns independent settings objects', () => {
    const first = createDefaultPublicationDocumentSettings()
    const second = createDefaultPublicationDocumentSettings()

    expect(first).not.toBe(second)
    expect(first.margins).not.toBe(second.margins)
  })
})
