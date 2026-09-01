import {
  createPublicationLayout,
  PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS,
  type PublicationLayoutBlockAllocation,
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
const RATING_SIZE_POINTS = 12

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

type PublicationPdfInteractiveFieldBase = {
  name: string
  blockId: string
  pageNumber: number
  label: string
}

export type PublicationPdfMultilineField = PublicationPdfInteractiveFieldBase & {
  kind: 'multiline-text'
  rect: PublicationPdfRect
}

export type PublicationPdfCheckboxField = PublicationPdfInteractiveFieldBase & {
  kind: 'checkbox'
  rect: PublicationPdfRect
}

export type PublicationPdfRatingField = PublicationPdfInteractiveFieldBase & {
  kind: 'rating'
  options: Array<{
    value: string
    rect: PublicationPdfRect
  }>
}

export type PublicationPdfInteractiveField =
  | PublicationPdfMultilineField
  | PublicationPdfCheckboxField
  | PublicationPdfRatingField

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
  allocations: readonly PublicationLayoutBlockAllocation[],
): PublicationPdfBlockPlacement[] {
  const allocationByBlockId = new Map(
    allocations.map((allocation) => [allocation.blockId, allocation.allocatedUnits]),
  )
  let top = US_LETTER_HEIGHT_POINTS - PUBLICATION_MARGIN_POINTS

  return blocks.map((block) => {
    const allocatedUnits = allocationByBlockId.get(block.id) ?? 0
    const height = allocatedUnits * CAPACITY_UNIT_HEIGHT_POINTS
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

function createRatingOptions(
  block: Extract<PublicationBlock, { type: 'rating-field' }>,
  placement: PublicationPdfBlockPlacement,
) {
  const values = Array.from(
    { length: Math.max(1, Math.floor(block.max - block.min) + 1) },
    (_, index) => block.min + index,
  )
  const slotWidth = placement.rect.width / values.length
  const y = placement.rect.y + Math.max(8, Math.min(24, placement.rect.height / 3))

  return values.map((value, index) => ({
    value: String(value),
    rect: {
      x: placement.rect.x + index * slotWidth + Math.max(0, (slotWidth - RATING_SIZE_POINTS) / 2),
      y,
      width: RATING_SIZE_POINTS,
      height: RATING_SIZE_POINTS,
    },
  }))
}

export function createPublicationPdfPlan(publication: Publication): PublicationPdfPlan {
  const layout = createPublicationLayout(publication)
  const interactiveFields: PublicationPdfInteractiveField[] = []

  const pages = layout.pages.map((page) => {
    const blockPlacements = createBlockPlacements(page.blocks, page.allocations)
    const pageNumber = page.pageNumber

    if (page.kind === 'content' && pageNumber !== undefined) {
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
            pageNumber,
            kind: 'multiline-text',
            label: block.text,
            rect,
          })
        }

        if (block.type === 'checkbox-field' && rect) {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber,
            kind: 'checkbox',
            label: block.text,
            rect,
          })
        }

        if (block.type === 'rating-field') {
          interactiveFields.push({
            name: createFieldName(publication.id, block.id),
            blockId: block.id,
            pageNumber,
            kind: 'rating',
            label: block.text,
            options: createRatingOptions(block, placement),
          })
        }
      })
    }

    return {
      sequence: page.sequence,
      pageNumber,
      kind: page.kind,
      width: US_LETTER_WIDTH_POINTS,
      height: US_LETTER_HEIGHT_POINTS,
      margin: PUBLICATION_MARGIN_POINTS,
      blocks: page.blocks.map((block) => {
        if (block.type === 'table') {
          return {
            ...block,
            columns: [...block.columns],
            rows: block.rows.map((row) => [...row]),
            layout: block.layout ? { ...block.layout } : undefined,
          }
        }

        return {
          ...block,
          layout: block.layout ? { ...block.layout } : undefined,
        }
      }),
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
