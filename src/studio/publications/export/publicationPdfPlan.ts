import {
  createPublicationLayout,
  estimatePublicationBlockUnits,
  PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS,
} from '../layout'
import type { Publication, PublicationBlock } from '../types'

export const PDF_POINTS_PER_INCH = 72
export const US_LETTER_WIDTH_POINTS = 612
export const US_LETTER_HEIGHT_POINTS = 792
export const PUBLICATION_MARGIN_POINTS = 54
export const PUBLICATION_PAGE_NUMBER_RESERVE_POINTS = 24
export const PUBLICATION_CONTENT_WIDTH_POINTS = 504
export const PUBLICATION_CONTENT_HEIGHT_POINTS = 660

const CAPACITY_UNIT_HEIGHT_POINTS =
  PUBLICATION_CONTENT_HEIGHT_POINTS / PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS
const MULTILINE_PROMPT_RESERVE_POINTS = 30
const CHECKBOX_SIZE_POINTS = 14

export type PublicationPdfRect = {
  x: number
  y: number
  width: number
  height: number
}

export type PublicationPdfBlockPlacement = {
  blockId: string
  type: PublicationBlock['type']
  rect: PublicationPdfRect
}

export type PublicationPdfInteractiveField = {
  name: string
  blockId: string
  pageNumber: number
  kind: 'multiline-text' | 'checkbox'
  label: string
  rect: PublicationPdfRect
}

export type PublicationPdfPagePlan = {
  sequence: number
  pageNumber?: number
  kind: 'cover' | 'content'
  width: number
  height: number
  margin: number
  blocks: PublicationBlock[]
  blockPlacements: PublicationPdfBlockPlacement[]
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

function createBlockPlacements(
  blocks: readonly PublicationBlock[],
): PublicationPdfBlockPlacement[] {
  let top = US_LETTER_HEIGHT_POINTS - PUBLICATION_MARGIN_POINTS

  return blocks.map((block) => {
    const height = estimatePublicationBlockUnits(block) * CAPACITY_UNIT_HEIGHT_POINTS
    const rect = {
      x: PUBLICATION_MARGIN_POINTS,
      y: top - height,
      width: PUBLICATION_CONTENT_WIDTH_POINTS,
      height,
    }

    top -= height

    return {
      blockId: block.id,
      type: block.type,
      rect,
    }
  })
}

function createInteractiveRect(
  block: PublicationBlock,
  placement: PublicationPdfBlockPlacement,
): PublicationPdfRect | undefined {
  if (block.type === 'multiline-text-field') {
    return {
      x: placement.rect.x,
      y: placement.rect.y,
      width: placement.rect.width,
      height: Math.max(72, placement.rect.height - MULTILINE_PROMPT_RESERVE_POINTS),
    }
  }

  if (block.type === 'checkbox-field') {
    return {
      x: placement.rect.x,
      y: placement.rect.y + placement.rect.height - CHECKBOX_SIZE_POINTS - 2,
      width: CHECKBOX_SIZE_POINTS,
      height: CHECKBOX_SIZE_POINTS,
    }
  }

  return undefined
}

export function createPublicationPdfPlan(publication: Publication): PublicationPdfPlan {
  const layout = createPublicationLayout(publication)
  const interactiveFields: PublicationPdfInteractiveField[] = []

  const pages = layout.pages.map((page) => {
    const blockPlacements = createBlockPlacements(page.blocks)

    if (page.kind === 'content' && page.pageNumber !== undefined) {
      page.blocks.forEach((block, index) => {
        const placement = blockPlacements[index]

        if (!placement) {
          return
        }

        const rect = createInteractiveRect(block, placement)

        if (block.type === 'multiline-text-field' && rect) {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber: page.pageNumber,
            kind: 'multiline-text',
            label: block.text,
            rect,
          })
        }

        if (block.type === 'checkbox-field' && rect) {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber: page.pageNumber,
            kind: 'checkbox',
            label: block.text,
            rect,
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
      blockPlacements,
    }
  })

  return {
    publicationId: publication.id,
    title: publication.title,
    pages,
    interactiveFields,
  }
}
