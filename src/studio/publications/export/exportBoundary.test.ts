import { describe, expect, it } from 'vitest'

import * as publicationExport from './index'

describe('fillable PDF export boundary', () => {
  it('keeps the binary serializer out of the public export barrel', () => {
    expect(publicationExport).toHaveProperty('downloadFillablePublicationPdf')
    expect(publicationExport).not.toHaveProperty('generateFillablePublicationPdf')
  })
})
