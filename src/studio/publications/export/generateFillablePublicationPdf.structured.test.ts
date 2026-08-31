import { PDFDocument, PDFRadioGroup } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { generateFillablePublicationPdf } from './generateFillablePublicationPdf'

describe('generateFillablePublicationPdf structured components', () => {
  it('serializes a rating scale as one AcroForm radio group with stable options', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        id: 'energy-audit',
        content: {
          blocks: [
            {
              id: 'rating-1',
              type: 'rating-field',
              text: 'Energy right now',
              min: 0,
              max: 3,
            },
          ],
        },
      }),
    )

    const document = await PDFDocument.load(bytes)
    const rating = document
      .getForm()
      .getRadioGroup('publication.energy-audit.block.rating-1')

    expect(rating).toBeInstanceOf(PDFRadioGroup)
    expect(rating.getOptions()).toEqual(['0', '1', '2', '3'])
  })

  it('renders table content without creating a form field for the table itself', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'table-1',
              type: 'table',
              text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |',
            },
          ],
        },
      }),
    )

    const document = await PDFDocument.load(bytes)
    expect(document.getForm().getFields()).toEqual([])
    expect(document.getPages()).toHaveLength(2)
  })
})
