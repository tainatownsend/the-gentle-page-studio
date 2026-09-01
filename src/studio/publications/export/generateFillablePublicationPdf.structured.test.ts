import { PDFDocument, PDFRadioGroup } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { generateFillablePublicationPdf } from './generateFillablePublicationPdf'

describe('structured fillable publication PDF', () => {
  it('serializes rating fields as one AcroForm radio group with stable options', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        id: 'energy-audit',
        content: {
          blocks: [
            {
              id: 'energy-rating',
              type: 'rating-field',
              text: 'Energy right now',
              min: 0,
              max: 10,
            },
          ],
        },
      }),
    )

    const document = await PDFDocument.load(bytes)
    const field = document
      .getForm()
      .getRadioGroup('publication.energy-audit.block.energy-rating')

    expect(field).toBeInstanceOf(PDFRadioGroup)
    expect(field.getOptions()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
  })

  it('renders structured worksheet tables without creating accidental form fields', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'capacity-table',
              type: 'table',
              text: 'Capacity baseline',
              columns: ['Area', 'Capacity', 'What would help?'],
              rows: [
                ['Physical', 'Low', 'More rest'],
                ['Mental', 'Medium', 'Fewer decisions'],
              ],
            },
          ],
        },
      }),
    )

    const document = await PDFDocument.load(bytes)

    expect(document.getPages()).toHaveLength(2)
    expect(document.getForm().getFields()).toEqual([])
  })
})
