import { createPublicationLayout } from '../layout'
import type { Publication, PublicationBlock } from '../types'

export const PDF_POINTS_PER_INCH = 72
export const US_LETTER_WIDTH_POINTS = 8.5 * PDF_POINTS_PER_INCH
export const US_LETTER_HEIGHT_POINTS = 11 * PDF_POINTS_PER_INCH
export const PUBLICATION_MARGIN_POINTS = 0.75 * PDF_POINTS_PER_INCH

export type PublicationPdfInteractiveFieldKind = 'multiline-text' | 'checkbox'

export type PublicationPdfInteractiveField = {
  name: string
  blockId: string
  pageNumber: number
  kind: PublicationPdfInteractiveFieldKind
  label: string
}

export type PublicationPdfPagePlan = {
  sequence: number
  pageNumber?: number
  kind: 'cover' | 'content'
  width: number
  height: number
  margin: number
  blocks: PublicationBlock[]
}

export type PublicationPdfPlan = {
  publicationId: string
  title: string
  pages: PublicationPdfPagePlan[]
  interactiveFields: PublicationPdfInteractiveField[]
}

function createFieldName(publicationId: string, blockId: string): string {
  return `publication.${publicationId}.block.${blockId}`
}

export function createPublicationPdfPlan(publication: Publication): PublicationPdfPlan {
  const layout = createPublicationLayout(publication)
  const interactiveFields: PublicationPdfInteractiveField[] = []

  const pages = layout.pages.map((page) => {
    if (page.kind === 'content' && page.pageNumber !== undefined) {
      page.blocks.forEach((block) => {
        if (block.type === 'multiline-text-field') {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber: page.pageNumber as number,
            kind: 'multiline-text',
            label: block.text,
          })
        }

        if (block.type === 'checkbox-field') {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber: page.pageNumber as number,
            kind: 'checkbox',
            label: block.text,
          })
        }
      })
    }

    return {
      sequence: page.sequence,
      pageNumber: page.pageNumber,
      kind: page.kind,
      width: US_LETTER_WIDTH_POINTS,
      height: US_LETTER_HEIGHT_POINTS,
      margin: PUBLICATION_MARGIN_POINTS,
      blocks: page.blocks.map((block) => ({ ...block })),
    }
  })

  return {
    publicationId: publication.id,
    title: publication.title,
    pages,
    interactiveFields,
  }
}
