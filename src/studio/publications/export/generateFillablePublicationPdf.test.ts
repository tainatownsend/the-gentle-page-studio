import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { createPublicationFixture } from '../testing'
import { generateFillablePublicationPdf } from './generateFillablePublicationPdf'

describe('generateFillablePublicationPdf', () => {
  it('generates a readable US Letter PDF with cover and numbered content pages', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        title: 'Gentle Focus Journal',
        description: 'A supportive focus practice.',
        content: {
          blocks: [
            {
              id: 'heading-1',
              type: 'heading',
              level: 1,
              text: 'Pause and notice',
            },
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'What feels most present right now?',
            },
          ],
        },
      }),
    )

    expect(bytes.byteLength).toBeGreaterThan(0)

    const document = await PDFDocument.load(bytes)
    const pages = document.getPages()

    expect(pages).toHaveLength(2)
    expect(pages[0]?.getSize()).toEqual({ width: 612, height: 792 })
    expect(pages[1]?.getSize()).toEqual({ width: 612, height: 792 })
  })

  it('serializes multiline response fields and checkboxes as AcroForm fields', async () => {
    const publication = createPublicationFixture({
      id: 'fillable-journal',
      content: {
        blocks: [
          {
            id: 'response-1',
            type: 'multiline-text-field',
            text: 'What would support you today?',
          },
          {
            id: 'checkbox-1',
            type: 'checkbox-field',
            text: 'I completed this reflection.',
          },
        ],
      },
    })

    const bytes = await generateFillablePublicationPdf(publication)
    const document = await PDFDocument.load(bytes)
    const fields = document.getForm().getFields()

    expect(fields).toHaveLength(2)
    expect(fields.map((field) => field.getName())).toEqual([
      'publication.fillable-journal.block.response-1',
      'publication.fillable-journal.block.checkbox-1',
    ])

    const responseField = document
      .getForm()
      .getTextField('publication.fillable-journal.block.response-1')
    const checkboxField = document
      .getForm()
      .getCheckBox('publication.fillable-journal.block.checkbox-1')

    expect(responseField).toBeInstanceOf(PDFTextField)
    expect(responseField.isMultiline()).toBe(true)
    expect(checkboxField).toBeInstanceOf(PDFCheckBox)
    expect(checkboxField.isChecked()).toBe(false)
  })

  it('keeps interactive field names stable across the derived page plan', async () => {
    const publication = createPublicationFixture({
      id: 'multi-page-journal',
      content: {
        blocks: [
          {
            id: 'response-1',
            type: 'multiline-text-field',
            text: 'First response',
          },
          {
            id: 'response-2',
            type: 'multiline-text-field',
            text: 'Second response',
          },
          {
            id: 'response-3',
            type: 'multiline-text-field',
            text: 'Third response',
          },
        ],
      },
    })

    const bytes = await generateFillablePublicationPdf(publication)
    const document = await PDFDocument.load(bytes)

    expect(document.getPages()).toHaveLength(2)
    expect(document.getForm().getFields().map((field) => field.getName())).toEqual([
      'publication.multi-page-journal.block.response-1',
      'publication.multi-page-journal.block.response-2',
      'publication.multi-page-journal.block.response-3',
    ])
  })

  it('produces no AcroForm fields for static-only publications', async () => {
    const bytes = await generateFillablePublicationPdf(
      createPublicationFixture({
        content: {
          blocks: [
            {
              id: 'paragraph-1',
              type: 'paragraph',
              text: 'A quiet reflection.',
            },
          ],
        },
      }),
    )

    const document = await PDFDocument.load(bytes)

    expect(document.getForm().getFields()).toEqual([])
  })
})
