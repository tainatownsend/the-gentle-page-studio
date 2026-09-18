import {
  createPublicationLayout,
  type PublicationLayoutBlockAllocation,
} from '../layout'
import type { Publication, PublicationBlock, PublicationTableBlock } from '../types'

export const PDF_POINTS_PER_INCH = 72
export const US_LETTER_WIDTH_POINTS = 612
export const US_LETTER_HEIGHT_POINTS = 792
export const PUBLICATION_MARGIN_POINTS = 54
export const PUBLICATION_PAGE_NUMBER_RESERVE_POINTS = 24
export const PUBLICATION_CONTENT_WIDTH_POINTS = 504
export const PUBLICATION_CONTENT_HEIGHT_POINTS = 660

export const PUBLICATION_PDF_BLOCK_GAP_POINTS = 16

const RESPONSE_AREA_UNIT_HEIGHT_POINTS = 6
const MULTILINE_HORIZONTAL_PADDING_POINTS = 14
const MULTILINE_BOTTOM_PADDING_POINTS = 12
const MULTILINE_PROMPT_RESERVE_POINTS = 50
// Interactive controls need to remain comfortably tappable on mobile PDF viewers.
// Keep the visible affordance and the widget hit target aligned so customers do not
// have to hit a tiny hotspot on top of a printed checkbox or rating circle.
const CHECKBOX_SIZE_POINTS = 18
const RATING_SIZE_POINTS = 16
const TABLE_CAPTION_RESERVE_POINTS = 22
const TABLE_CELL_PADDING_POINTS = 8

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

function createTableCellFieldName(
  publicationId: string,
  blockId: string,
  rowIndex: number,
  columnIndex: number,
  controlIndex: number,
): string {
  return `publication.${publicationId}.block.${blockId}.cell.${rowIndex}.${columnIndex}.${controlIndex}`
}

function estimateVisualLines(text: string, charactersPerLine: number): number {
  return Math.max(1, Math.ceil(Math.max(text.trim().length, 1) / charactersPerLine))
}

function responseAreaMinimumPoints(size: 'short' | 'medium' | 'long' | undefined): number {
  switch (size) {
    case 'short':
      return 42
    case 'medium':
      return 66
    case 'long':
    default:
      return 90
  }
}

function createTableNaturalRowHeights(block: PublicationTableBlock): {
  headerHeight: number
  rowHeights: number[]
} {
  const columnCount = Math.max(block.columns.length, 1)
  const headerLines = Math.max(
    ...block.columns.map((cell) => estimateVisualLines(cell, Math.max(18, 52 / columnCount))),
    1,
  )
  const headerHeight = 30 + (headerLines - 1) * 11

  const rowHeights = block.rows.map((row, rowIndex) => {
    const textLines = Math.max(
      ...row.map((cell) => estimateVisualLines(cell, Math.max(20, 58 / columnCount))),
      1,
    )
    const textHeight = 30 + (textLines - 1) * 11
    const controls = block.cellControls?.[rowIndex]?.flat() ?? []
    const responseHeight = controls.reduce((height, control) => {
      if (control.kind !== 'response') return height
      return Math.max(height, responseAreaMinimumPoints(control.size) + 16)
    }, 0)
    const checkboxHeight = controls.some((control) => control.kind === 'checkbox')
      ? CHECKBOX_SIZE_POINTS + 18
      : 0

    return Math.max(textHeight, responseHeight, checkboxHeight)
  })

  return { headerHeight, rowHeights }
}

function estimatePdfBlockHeight(
  block: PublicationBlock,
  allocation: PublicationLayoutBlockAllocation | undefined,
): number {
  const allocatedUnits = allocation?.allocatedUnits ?? allocation?.baselineUnits ?? 0

  switch (block.type) {
    case 'heading': {
      const charactersPerLine = block.level === 1 ? 44 : block.level === 2 ? 58 : 72
      const lines = estimateVisualLines(block.text, charactersPerLine)
      if (block.level === 1) return 62 + (lines - 1) * 24
      if (block.level === 2) return 28 + (lines - 1) * 19
      return 18 + (lines - 1) * 13
    }
    case 'paragraph': {
      const lines = estimateVisualLines(block.text, 78)
      return 18 + (lines - 1) * 15
    }
    case 'multiline-text-field': {
      const promptLines = estimateVisualLines(block.text, 72)
      const responseHeight = Math.max(
        responseAreaMinimumPoints(block.responseSize),
        allocatedUnits * RESPONSE_AREA_UNIT_HEIGHT_POINTS,
      )
      return 48 + (promptLines - 1) * 14 + responseHeight
    }
    case 'checkbox-field': {
      const lines = estimateVisualLines(block.text, 72)
      return Math.max(CHECKBOX_SIZE_POINTS + 8, 26 + (lines - 1) * 15)
    }
    case 'rating-field': {
      const promptLines = estimateVisualLines(block.text, 72)
      const optionCount = Math.max(1, Math.floor(block.max - block.min) + 1)
      const optionRows = Math.max(1, Math.ceil(optionCount / 14))
      return 76 + (promptLines - 1) * 14 + (optionRows - 1) * 26
    }
    case 'table': {
      const geometry = createTableNaturalRowHeights(block)
      return (
        (block.text ? TABLE_CAPTION_RESERVE_POINTS : 0) +
        geometry.headerHeight +
        geometry.rowHeights.reduce((total, height) => total + height, 0)
      )
    }
  }
}

function createBlockPlacements(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): PublicationPdfBlockPlacement[] {
  if (blocks.length === 0) return []

  const allocationByBlockId = new Map(
    allocations.map((allocation) => [allocation.blockId, allocation]),
  )
  const desiredHeights = blocks.map((block) =>
    estimatePdfBlockHeight(block, allocationByBlockId.get(block.id)),
  )
  const totalGapHeight = PUBLICATION_PDF_BLOCK_GAP_POINTS * Math.max(0, blocks.length - 1)
  const availableBlockHeight = Math.max(1, PUBLICATION_CONTENT_HEIGHT_POINTS - totalGapHeight)
  const desiredBlockHeight = desiredHeights.reduce((total, height) => total + height, 0)
  const scale = desiredBlockHeight > availableBlockHeight
    ? availableBlockHeight / desiredBlockHeight
    : 1

  let top = US_LETTER_HEIGHT_POINTS - PUBLICATION_MARGIN_POINTS

  return blocks.map((block, index) => {
    const height = Math.max(12, (desiredHeights[index] ?? 12) * scale)
    const rect = {
      x: PUBLICATION_MARGIN_POINTS,
      y: top - height,
      width: PUBLICATION_CONTENT_WIDTH_POINTS,
      height,
    }

    top -= height + PUBLICATION_PDF_BLOCK_GAP_POINTS

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
      x: placement.rect.x + MULTILINE_HORIZONTAL_PADDING_POINTS,
      y: placement.rect.y + MULTILINE_BOTTOM_PADDING_POINTS,
      width: Math.max(24, placement.rect.width - MULTILINE_HORIZONTAL_PADDING_POINTS * 2),
      height: Math.max(24, placement.rect.height - MULTILINE_PROMPT_RESERVE_POINTS),
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

export function createPublicationPdfTableGeometry(
  block: PublicationTableBlock,
  placement: PublicationPdfBlockPlacement,
) {
  const columnCount = Math.max(block.columns.length, 1)
  const columnWidth = placement.rect.width / columnCount
  const captionReserve = block.text ? TABLE_CAPTION_RESERVE_POINTS : 0
  const natural = createTableNaturalRowHeights(block)
  const naturalTableHeight =
    natural.headerHeight + natural.rowHeights.reduce((total, height) => total + height, 0)
  const availableTableHeight = Math.max(24, placement.rect.height - captionReserve)
  const scale = naturalTableHeight > 0 ? availableTableHeight / naturalTableHeight : 1

  return {
    columnWidth,
    captionReserve,
    headerHeight: natural.headerHeight * scale,
    rowHeights: natural.rowHeights.map((height) => height * scale),
    tableTop: placement.rect.y + placement.rect.height - captionReserve,
  }
}

function createTableCellInteractiveFields(
  publicationId: string,
  block: PublicationTableBlock,
  placement: PublicationPdfBlockPlacement,
  pageNumber: number,
): PublicationPdfInteractiveField[] {
  if (!block.cellControls) return []

  const fields: PublicationPdfInteractiveField[] = []
  const geometry = createPublicationPdfTableGeometry(block, placement)
  const columnWidth = geometry.columnWidth

  block.cellControls.forEach((row, rowIndex) => {
    row.forEach((controls, columnIndex) => {
      if (controls.length === 0) return

      const cellX = placement.rect.x + columnIndex * columnWidth
      const rowsBefore = geometry.rowHeights
        .slice(0, rowIndex)
        .reduce((total, height) => total + height, 0)
      const rowHeight = geometry.rowHeights[rowIndex] ?? 24
      const cellTop = geometry.tableTop - geometry.headerHeight - rowsBefore
      const cellY = cellTop - rowHeight
      const innerRect = {
        x: cellX + TABLE_CELL_PADDING_POINTS,
        y: cellY + TABLE_CELL_PADDING_POINTS,
        width: Math.max(12, columnWidth - TABLE_CELL_PADDING_POINTS * 2),
        height: Math.max(12, rowHeight - TABLE_CELL_PADDING_POINTS * 2),
      }
      const checkboxControls = controls.filter((control) => control.kind === 'checkbox')
      let checkboxIndex = 0

      controls.forEach((control, controlIndex) => {
        const name = createTableCellFieldName(
          publicationId,
          block.id,
          rowIndex,
          columnIndex,
          controlIndex,
        )
        const label = `${block.columns[columnIndex] || 'Worksheet'} row ${rowIndex + 1}`

        if (control.kind === 'response') {
          fields.push({
            name,
            blockId: block.id,
            pageNumber,
            kind: 'multiline-text',
            label,
            rect: innerRect,
          })
          return
        }

        const slotWidth = innerRect.width / Math.max(checkboxControls.length, 1)
        fields.push({
          name,
          blockId: block.id,
          pageNumber,
          kind: 'checkbox',
          label,
          rect: {
            x:
              innerRect.x +
              checkboxIndex * slotWidth +
              Math.max(0, (slotWidth - CHECKBOX_SIZE_POINTS) / 2),
            y: innerRect.y + Math.max(0, (innerRect.height - CHECKBOX_SIZE_POINTS) / 2),
            width: CHECKBOX_SIZE_POINTS,
            height: CHECKBOX_SIZE_POINTS,
          },
        })
        checkboxIndex += 1
      })
    })
  })

  return fields
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

        if (block.type === 'table') {
          interactiveFields.push(
            ...createTableCellInteractiveFields(publication.id, block, placement, pageNumber),
          )
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
            cellControls: block.cellControls?.map((row) =>
              row.map((controls) => controls.map((control) => ({ ...control }))),
            ),
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
