import { createPublicationLayout } from '../layout'
import type { Publication } from '../types'

export type FillablePdfFieldKind = 'multiline-text' | 'checkbox'

export type FillablePdfFieldPlan = {
  name: string
  kind: FillablePdfFieldKind
  publicationId: string
  blockId: string
  prompt: string
  layoutPageSequence: number
  contentPageNumber: number
  blockIndexOnPage: number
}

export type FillablePdfExportPagePlan = {
  layoutPageSequence: number
  contentPageNumber: number
  fields: FillablePdfFieldPlan[]
}

export type FillablePdfExportPlan = {
  publicationId: string
  pages: FillablePdfExportPagePlan[]
  fields: FillablePdfFieldPlan[]
}

function sanitizeFieldNamePart(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_')
}

export function createFillablePdfFieldName(
  publicationId: string,
  blockId: string,
): string {
  return `publication.${sanitizeFieldNamePart(publicationId)}.block.${sanitizeFieldNamePart(blockId)}`
}

export function createFillablePdfExportPlan(
  publication: Publication,
): FillablePdfExportPlan {
  const layout = createPublicationLayout(publication)

  const pages = layout.pages.flatMap((page) => {
    if (page.kind !== 'content' || page.pageNumber === undefined) {
      return []
    }

    const fields = page.blocks.flatMap((block, blockIndexOnPage) => {
      if (block.type !== 'multiline-text-field' && block.type !== 'checkbox-field') {
        return []
      }

      const field: FillablePdfFieldPlan = {
        name: createFillablePdfFieldName(publication.id, block.id),
        kind: block.type === 'multiline-text-field' ? 'multiline-text' : 'checkbox',
        publicationId: publication.id,
        blockId: block.id,
        prompt: block.text,
        layoutPageSequence: page.sequence,
        contentPageNumber: page.pageNumber,
        blockIndexOnPage,
      }

      return [field]
    })

    return [
      {
        layoutPageSequence: page.sequence,
        contentPageNumber: page.pageNumber,
        fields,
      },
    ]
  })

  return {
    publicationId: publication.id,
    pages,
    fields: pages.flatMap((page) => page.fields),
  }
}
