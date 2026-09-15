import { describe, expect, it } from 'vitest'

import { createPublicationPdfFilename } from './downloadFillablePublicationPdf'

describe('createPublicationPdfFilename', () => {
  it('creates a deterministic filesystem-friendly filename', () => {
    expect(createPublicationPdfFilename('  Gentle Fócus Journal!  ')).toBe(
      'gentle-focus-journal-fillable.pdf',
    )
  })

  it('uses a publication fallback when the title has no filename-safe characters', () => {
    expect(createPublicationPdfFilename('***')).toBe('publication-fillable.pdf')
  })
})
