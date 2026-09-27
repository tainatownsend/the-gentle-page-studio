import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib'

import { getPublicationPageTemplateLabel } from '../layout'
import type { Publication, PublicationBlock, PublicationPageTemplate } from '../types'
import {
  createPublicationPdfPlan,
  createPublicationPdfTableGeometry,
  PUBLICATION_MARGIN_POINTS,
  type PublicationPdfBlockPlacement,
  type PublicationPdfInteractiveField,
  type PublicationPdfPagePlan,
} from './publicationPdfPlan'

const INK = rgb(47 / 255, 58 / 255, 54 / 255)
const MUTED_INK = rgb(104 / 255, 115 / 255, 109 / 255)
const RULE = rgb(217 / 255, 222 / 255, 217 / 255)
const PAPER = rgb(1, 1, 1)
const PAPER_STRONG = rgb(1, 1, 1)
const SAGE = rgb(107 / 255, 127 / 255, 114 / 255)
const SAGE_DEEP = rgb(64 / 255, 81 / 255, 72 / 255)
const SAGE_SOFT = rgb(231 / 255, 238 / 255, 233 / 255)
const CLAY = rgb(226 / 255, 211 / 255, 199 / 255)
const CLAY_SOFT = rgb(244 / 255, 236 / 255, 231 / 255)
const MIST = rgb(238 / 255, 243 / 255, 245 / 255)
const SAND_SOFT = rgb(247 / 255, 244 / 255, 239 / 255)
const FIELD = rgb(1, 1, 1)

function toWinAnsiSafeText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?')
}

function splitLongWord(word: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const chunks: string[] = []
  let current = ''

  for (const character of word) {
    const candidate = `${current}${character}`

    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      chunks.push(current)
      current = character
    } else {
      current = candidate
    }
  }

  if (current) {
    chunks.push(current)
  }

  return chunks
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const normalized = toWinAnsiSafeText(text).trim()

  if (!normalized) {
    return []
  }

  const sourceWords = normalized.split(/\s+/)
  const words = sourceWords.flatMap((word) =>
    font.widthOfTextAtSize(word, size) > maxWidth
      ? splitLongWord(word, font, size, maxWidth)
      : [word],
  )

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word

    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  x: number,
  top: number,
  maxWidth: number,
  lineHeight: number,
  maxHeight?: number,
  color: RGB = INK,
): void {
  const lines = wrapText(text, font, size, maxWidth)
  const maxLines = maxHeight ? Math.max(1, Math.floor(maxHeight / lineHeight)) : lines.length

  lines.slice(0, maxLines).forEach((line, index) => {
    page.drawText(line, {
      x,
      y: top - size - index * lineHeight,
      size,
      font,
      color,
    })
  })
}

function drawPageFoundation(page: PDFPage): void {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: PAPER,
  })
}

function drawBotanicalSprig(
  page: PDFPage,
  originX: number,
  originY: number,
  directionX: 1 | -1,
  directionY: 1 | -1,
): void {
  const endX = originX + directionX * 92
  const endY = originY + directionY * 112

  page.drawLine({
    start: { x: originX, y: originY },
    end: { x: endX, y: endY },
    thickness: 1.25,
    color: SAGE_DEEP,
    opacity: 0.48,
  })

  const leafOffsets = [
    { x: 20, y: 24, side: -1 },
    { x: 38, y: 45, side: 1 },
    { x: 55, y: 67, side: -1 },
    { x: 72, y: 88, side: 1 },
  ] as const

  leafOffsets.forEach(({ x, y, side }, index) => {
    const stemX = originX + directionX * x
    const stemY = originY + directionY * y
    page.drawEllipse({
      x: stemX + directionX * side * 9,
      y: stemY,
      xScale: 11,
      yScale: 5.5,
      color: index % 2 === 0 ? SAGE_SOFT : SAGE,
      opacity: index % 2 === 0 ? 0.9 : 0.48,
    })
  })
}

function getPlacementBounds(
  placements: readonly PublicationPdfBlockPlacement[],
): { x: number; y: number; width: number; height: number } | undefined {
  if (placements.length === 0) return undefined

  const left = Math.min(...placements.map((placement) => placement.rect.x))
  const bottom = Math.min(...placements.map((placement) => placement.rect.y))
  const right = Math.max(
    ...placements.map((placement) => placement.rect.x + placement.rect.width),
  )
  const top = Math.max(
    ...placements.map((placement) => placement.rect.y + placement.rect.height),
  )

  return {
    x: left,
    y: bottom,
    width: right - left,
    height: top - bottom,
  }
}

function drawTemplateZones(page: PDFPage, pagePlan: PublicationPdfPagePlan): void {
  if (pagePlan.pageTemplate === 'tool-overview') {
    const sectionStarts = pagePlan.blocks
      .map((block, index) =>
        block.type === 'heading' && block.level === 3 ? index : -1,
      )
      .filter((index) => index >= 0)

    sectionStarts.forEach((startIndex, sectionIndex) => {
      const nextStart = sectionStarts[sectionIndex + 1] ?? pagePlan.blocks.length
      const bounds = getPlacementBounds(
        pagePlan.blockPlacements.slice(startIndex, nextStart),
      )
      if (!bounds) return

      const fill =
        sectionIndex % 3 === 0
          ? CLAY_SOFT
          : sectionIndex % 3 === 1
            ? SAGE_SOFT
            : MIST
      page.drawRectangle({
        x: bounds.x - 10,
        y: bounds.y - 10,
        width: bounds.width + 20,
        height: bounds.height + 20,
        color: fill,
        opacity: 0.72,
        borderColor: RULE,
        borderWidth: 0.55,
      })

      page.drawCircle({
        x: bounds.x - 1,
        y: bounds.y + bounds.height - 7,
        size: 8,
        color: PAPER,
        borderColor: SAGE,
        borderWidth: 0.7,
      })
    })
    return
  }

  if (pagePlan.pageTemplate === 'sensory-reset') {
    const sectionStarts = pagePlan.blocks
      .map((block, index) =>
        block.type === 'heading' && block.level === 3 ? index : -1,
      )
      .filter((index) => index >= 0)
      .slice(0, 5)

    sectionStarts.forEach((startIndex, sectionIndex) => {
      const nextStart = sectionStarts[sectionIndex + 1] ?? pagePlan.blocks.length
      const bounds = getPlacementBounds(
        pagePlan.blockPlacements.slice(startIndex, nextStart),
      )
      if (!bounds) return

      const markerY = bounds.y + bounds.height - 9
      page.drawCircle({
        x: PUBLICATION_MARGIN_POINTS + 14,
        y: markerY,
        size: 10,
        color:
          sectionIndex % 2 === 0
            ? SAGE_SOFT
            : sectionIndex % 3 === 1
              ? CLAY_SOFT
              : MIST,
        borderColor: RULE,
        borderWidth: 0.45,
      })

      page.drawLine({
        start: { x: PUBLICATION_MARGIN_POINTS, y: bounds.y - 4 },
        end: { x: page.getWidth() - PUBLICATION_MARGIN_POINTS, y: bounds.y - 4 },
        thickness: 0.45,
        color: RULE,
      })
    })
    return
  }

  if (pagePlan.pageTemplate === 'emergency-tool') {
    const stepStarts = pagePlan.blocks
      .map((block, index) =>
        block.type === 'heading' && block.level === 3 ? index : -1,
      )
      .filter((index) => index >= 0)

    stepStarts.forEach((startIndex, stepIndex) => {
      const nextStart = stepStarts[stepIndex + 1] ?? pagePlan.blocks.length
      const bounds = getPlacementBounds(
        pagePlan.blockPlacements.slice(startIndex, nextStart),
      )
      if (!bounds) return

      const fill =
        stepIndex === 0 ? SAND_SOFT : stepIndex === 1 ? SAGE_SOFT : CLAY_SOFT
      page.drawRectangle({
        x: PUBLICATION_MARGIN_POINTS - 4,
        y: bounds.y - 4,
        width: page.getWidth() - (PUBLICATION_MARGIN_POINTS - 4) * 2,
        height: bounds.height + 8,
        color: fill,
        opacity: 0.62,
        borderColor: RULE,
        borderWidth: 0.6,
      })
    })
    return
  }

  if (pagePlan.pageTemplate === 'daily-check-in') {
    const inventoryIndexes = pagePlan.blocks
      .map((block, index) => (block.type === 'checkbox-field' ? index : -1))
      .filter((index) => index >= 0)

    if (inventoryIndexes.length === 0) return

    const firstInventory = inventoryIndexes[0]
    const lastInventory = inventoryIndexes[inventoryIndexes.length - 1]
    if (firstInventory === undefined || lastInventory === undefined) return

    const previous = pagePlan.blocks[firstInventory - 1]
    const startIndex =
      previous?.type === 'heading' && previous.level === 3
        ? firstInventory - 1
        : firstInventory
    const bounds = getPlacementBounds(
      pagePlan.blockPlacements.slice(startIndex, lastInventory + 1),
    )
    if (!bounds) return

    page.drawRectangle({
      x: PUBLICATION_MARGIN_POINTS - 3,
      y: bounds.y - 3,
      width: page.getWidth() - (PUBLICATION_MARGIN_POINTS - 3) * 2,
      height: bounds.height + 6,
      color: SAGE_SOFT,
      opacity: 0.48,
      borderColor: RULE,
      borderWidth: 0.55,
    })
  }
}

function drawRunningHeader(
  page: PDFPage,
  pagePlan: PublicationPdfPagePlan,
  bodyFont: PDFFont,
  bodyBoldFont: PDFFont,
): void {
  const brand = 'THE GENTLE PAGE'
  const section = getPublicationPageTemplateLabel(pagePlan.pageTemplate).toUpperCase()
  const sectionWidth = bodyBoldFont.widthOfTextAtSize(section, 7.5)
  const rightEdge = page.getWidth() - PUBLICATION_MARGIN_POINTS

  page.drawText(brand, {
    x: PUBLICATION_MARGIN_POINTS,
    y: 754,
    size: 7.5,
    font: bodyBoldFont,
    color: MUTED_INK,
  })

  page.drawText(section, {
    x: rightEdge - sectionWidth,
    y: 754,
    size: 7.5,
    font: bodyBoldFont,
    color: SAGE_DEEP,
  })

  page.drawRectangle({
    x: PUBLICATION_MARGIN_POINTS,
    y: 744,
    width: page.getWidth() - PUBLICATION_MARGIN_POINTS * 2,
    height: 0.6,
    color: RULE,
  })
}

function drawContentPageDecoration(
  page: PDFPage,
  blocks: readonly PublicationBlock[],
  pageTemplate?: PublicationPageTemplate,
): void {
  if (pageTemplate === 'section-opener' || pageTemplate === 'closing') {
    page.drawRectangle({
      x: page.getWidth() / 2 - 30,
      y: page.getHeight() - 64,
      width: 60,
      height: 2,
      color: SAGE,
    })
    return
  }

  if (pageTemplate === 'emergency-tool') {
    page.drawRectangle({
      x: PUBLICATION_MARGIN_POINTS,
      y: page.getHeight() - 52,
      width: 84,
      height: 3,
      color: SAGE,
    })
    return
  }

  if (
    pageTemplate === 'planner-tracker' ||
    pageTemplate === 'matrix-framework' ||
    blocks.some((block) => block.type === 'table')
  ) {
    page.drawRectangle({
      x: PUBLICATION_MARGIN_POINTS,
      y: page.getHeight() - 48,
      width: page.getWidth() - PUBLICATION_MARGIN_POINTS * 2,
      height: 1,
      color: SAGE_SOFT,
    })
  }
}

function drawCover(
  page: PDFPage,
  publication: Publication,
  displayFont: PDFFont,
  bodyFont: PDFFont,
): void {
  const centerX = 306
  const brand = 'THE GENTLE PAGE'
  const brandSize = 9
  const brandWidth = bodyFont.widthOfTextAtSize(brand, brandSize)

  drawBotanicalSprig(page, 596, 774, -1, -1)
  drawBotanicalSprig(page, 16, 18, 1, 1)

  page.drawText(brand, {
    x: centerX - brandWidth / 2,
    y: 701,
    size: brandSize,
    font: bodyFont,
    color: SAGE_DEEP,
  })

  const titleLines = wrapText(publication.title, displayFont, 31, 430)
  const titleLineHeight = 36
  const titleStartY = 440 + ((titleLines.length - 1) * titleLineHeight) / 2

  titleLines.forEach((line, index) => {
    const width = displayFont.widthOfTextAtSize(line, 31)
    page.drawText(line, {
      x: centerX - width / 2,
      y: titleStartY - index * titleLineHeight,
      size: 31,
      font: displayFont,
      color: INK,
    })
  })

  const dividerY = titleStartY - titleLines.length * titleLineHeight - 4
  page.drawRectangle({
    x: centerX - 36,
    y: dividerY,
    width: 36,
    height: 3,
    color: SAGE,
  })
  page.drawRectangle({
    x: centerX,
    y: dividerY,
    width: 36,
    height: 3,
    color: CLAY,
  })

  if (publication.description) {
    const descriptionLines = wrapText(publication.description, bodyFont, 11.5, 370)
    const descriptionStartY = dividerY - 26

    descriptionLines.slice(0, 5).forEach((line, index) => {
      const width = bodyFont.widthOfTextAtSize(line, 11.5)
      page.drawText(line, {
        x: centerX - width / 2,
        y: descriptionStartY - index * 17,
        size: 11.5,
        font: bodyFont,
        color: MUTED_INK,
      })
    })
  }

  const tagline = 'Thoughtfully designed tools for everyday clarity.'
  const taglineWidth = bodyFont.widthOfTextAtSize(tagline, 9.5)
  page.drawRectangle({
    x: centerX - 94,
    y: 84,
    width: 188,
    height: 0.8,
    color: RULE,
  })
  page.drawText(tagline, {
    x: centerX - taglineWidth / 2,
    y: 66,
    size: 9.5,
    font: bodyFont,
    color: MUTED_INK,
  })
}

function drawTableBlock(
  page: PDFPage,
  block: Extract<PublicationBlock, { type: 'table' }>,
  placement: PublicationPdfBlockPlacement,
  bodyFont: PDFFont,
  bodyBoldFont: PDFFont,
  pageTemplate?: PublicationPageTemplate,
): void {
  const geometry = createPublicationPdfTableGeometry(block, placement)
  const columnWidth = geometry.columnWidth

  if (block.text) {
    drawWrappedText(
      page,
      block.text,
      bodyBoldFont,
      11,
      placement.rect.x,
      placement.rect.y + placement.rect.height,
      placement.rect.width,
      14,
      geometry.captionReserve,
      SAGE_DEEP,
    )
  }

  const allRows = [block.columns, ...block.rows]
  const rowHeights = [geometry.headerHeight, ...geometry.rowHeights]
  let cellTop = geometry.tableTop

  allRows.forEach((row, rowIndex) => {
    const rowHeight = rowHeights[rowIndex] ?? 24
    const cellBottom = cellTop - rowHeight

    block.columns.forEach((_, columnIndex) => {
      const x = placement.rect.x + columnIndex * columnWidth
      const fill =
        rowIndex === 0
          ? SAGE_SOFT
          : pageTemplate === 'matrix-framework' && columnIndex === 0
            ? SAGE_SOFT
            : rowIndex % 2 === 0
              ? SAND_SOFT
              : PAPER_STRONG

      page.drawRectangle({
        x,
        y: cellBottom,
        width: columnWidth,
        height: rowHeight,
        color: fill,
        borderColor: RULE,
        borderWidth: 0.6,
      })

      drawWrappedText(
        page,
        row[columnIndex] ?? '',
        rowIndex === 0 ? bodyBoldFont : bodyFont,
        8.5,
        x + 8,
        cellTop - 6,
        Math.max(8, columnWidth - 16),
        10.5,
        Math.max(8, rowHeight - 12),
        rowIndex === 0 ? SAGE_DEEP : INK,
      )
    })

    cellTop = cellBottom
  })
}

function drawStaticBlock(
  page: PDFPage,
  block: PublicationBlock,
  placement: PublicationPdfBlockPlacement,
  displayFont: PDFFont,
  bodyFont: PDFFont,
  bodyBoldFont: PDFFont,
  pageTemplate?: PublicationPageTemplate,
  templateStepNumber?: number,
  templateStateIndex?: number,
): void {
  const top = placement.rect.y + placement.rect.height

  if (block.type === 'heading') {
    if (block.level === 1) {
      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y + 2,
        width: placement.rect.width,
        height: 0.7,
        color: RULE,
      })
      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y + 1.4,
        width: 38,
        height: 2,
        color: SAGE,
      })
      drawWrappedText(
        page,
        block.text || 'Untitled heading',
        displayFont,
        20,
        placement.rect.x,
        top - 3,
        placement.rect.width,
        24,
        Math.max(placement.rect.height - 8, 20),
        INK,
      )
      return
    }

    if (block.level === 2) {
      page.drawRectangle({
        x: placement.rect.x,
        y: top - 5,
        width: 28,
        height: 3,
        color: CLAY,
      })
      drawWrappedText(
        page,
        block.text || 'Untitled heading',
        displayFont,
        16,
        placement.rect.x + 38,
        top,
        placement.rect.width - 38,
        19,
        placement.rect.height,
      )
      return
    }

    if (pageTemplate === 'emergency-tool' && templateStepNumber) {
      const circleX = placement.rect.x + 9
      const circleY = top - 11
      page.drawCircle({
        x: circleX,
        y: circleY,
        size: 9,
        color: SAGE,
      })
      const stepText = String(templateStepNumber)
      const stepWidth = bodyBoldFont.widthOfTextAtSize(stepText, 8)
      page.drawText(stepText, {
        x: circleX - stepWidth / 2,
        y: circleY - 2.8,
        size: 8,
        font: bodyBoldFont,
        color: PAPER,
      })
      drawWrappedText(
        page,
        block.text || 'Untitled heading',
        bodyBoldFont,
        10.5,
        placement.rect.x + 28,
        top,
        placement.rect.width - 28,
        13,
        placement.rect.height,
        INK,
      )
      return
    }

    drawWrappedText(
      page,
      block.text || 'Untitled heading',
      bodyBoldFont,
      10.5,
      placement.rect.x,
      top,
      placement.rect.width,
      13,
      placement.rect.height,
      SAGE_DEEP,
    )
    return
  }

  if (block.type === 'paragraph') {
    const paragraphSize =
      pageTemplate === 'tool-overview'
        ? 9.2
        : pageTemplate === 'sensory-reset'
          ? 9.8
          : 11
    const paragraphLineHeight =
      pageTemplate === 'tool-overview'
        ? 12
        : pageTemplate === 'sensory-reset'
          ? 13
          : 15

    drawWrappedText(
      page,
      block.text || 'Empty paragraph',
      bodyFont,
      paragraphSize,
      placement.rect.x,
      top,
      placement.rect.width,
      paragraphLineHeight,
      placement.rect.height,
    )
    return
  }

  if (block.type === 'multiline-text-field') {
    page.drawRectangle({
      x: placement.rect.x,
      y: placement.rect.y,
      width: placement.rect.width,
      height: placement.rect.height,
      color: PAPER,
      borderColor: RULE,
      borderWidth: 0.5,
    })
    drawWrappedText(
      page,
      block.text || 'Response',
      bodyBoldFont,
      11,
      placement.rect.x + 14,
      top - 8,
      placement.rect.width - 28,
      14,
      28,
      SAGE_DEEP,
    )
    return
  }

  if (block.type === 'checkbox-field') {
    if (pageTemplate === 'guided-framework') {
      const stateFill =
        templateStateIndex === 1
          ? CLAY_SOFT
          : templateStateIndex === 2
            ? MIST
            : templateStateIndex === 3
              ? SAND_SOFT
              : SAGE_SOFT

      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y,
        width: placement.rect.width,
        height: placement.rect.height,
        color: stateFill,
        borderColor: RULE,
        borderWidth: 0.6,
      })
      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y,
        width: 3,
        height: placement.rect.height,
        color: SAGE,
      })
    }

    drawWrappedText(
      page,
      block.text || 'Checkbox',
      bodyFont,
      11,
      placement.rect.x + 22,
      top,
      placement.rect.width - 22,
      14,
      placement.rect.height,
    )
    return
  }

  if (block.type === 'rating-field') {
    page.drawRectangle({
      x: placement.rect.x,
      y: placement.rect.y,
      width: placement.rect.width,
      height: placement.rect.height,
      color: pageTemplate === 'daily-check-in' ? PAPER : SAGE_SOFT,
      borderColor: RULE,
      borderWidth: 0.5,
    })
    drawWrappedText(
      page,
      block.text || 'Rating',
      bodyBoldFont,
      11,
      placement.rect.x + 8,
      top - 4,
      placement.rect.width - 16,
      14,
      28,
      SAGE_DEEP,
    )
    return
  }

  drawTableBlock(page, block, placement, bodyFont, bodyBoldFont, pageTemplate)
}

function addInteractiveField(
  document: PDFDocument,
  page: PDFPage,
  field: PublicationPdfInteractiveField,
  bodyFont: PDFFont,
): void {
  const form = document.getForm()

  if (field.kind === 'multiline-text') {
    const textField = form.createTextField(field.name)
    textField.enableMultiline()
    textField.addToPage(page, {
      ...field.rect,
      font: bodyFont,
      textColor: INK,
      backgroundColor: FIELD,
      borderColor: SAGE,
      borderWidth: 0.8,
    })
    return
  }

  if (field.kind === 'checkbox') {
    const checkBox = form.createCheckBox(field.name)
    checkBox.addToPage(page, {
      ...field.rect,
      backgroundColor: PAPER_STRONG,
      borderColor: SAGE,
      borderWidth: 1,
    })
    return
  }

  const radioGroup = form.createRadioGroup(field.name)

  field.options.forEach((option) => {
    radioGroup.addOptionToPage(option.value, page, {
      ...option.rect,
      backgroundColor: PAPER_STRONG,
      borderColor: SAGE,
      borderWidth: 1,
    })

    const labelSize = 7
    const labelWidth = bodyFont.widthOfTextAtSize(option.value, labelSize)
    page.drawText(option.value, {
      x: option.rect.x + option.rect.width / 2 - labelWidth / 2,
      y: option.rect.y - 9,
      size: labelSize,
      font: bodyFont,
      color: MUTED_INK,
    })
  })
}

export async function generateFillablePublicationPdf(
  publication: Publication,
): Promise<Uint8Array> {
  const plan = createPublicationPdfPlan(publication)
  const document = await PDFDocument.create()
  const displayFont = await document.embedFont(StandardFonts.TimesRomanBold)
  const bodyFont = await document.embedFont(StandardFonts.Helvetica)
  const bodyBoldFont = await document.embedFont(StandardFonts.HelveticaBold)

  for (const pagePlan of plan.pages) {
    const page = document.addPage([pagePlan.width, pagePlan.height])
    drawPageFoundation(page)

    if (pagePlan.kind === 'cover') {
      drawCover(page, publication, displayFont, bodyFont)
      continue
    }

    drawRunningHeader(page, pagePlan, bodyFont, bodyBoldFont)
    drawContentPageDecoration(page, pagePlan.blocks, pagePlan.pageTemplate)
    drawTemplateZones(page, pagePlan)

    pagePlan.blocks.forEach((block, index) => {
      const placement = pagePlan.blockPlacements[index]

      if (placement) {
        const templateStepNumber =
          pagePlan.pageTemplate === 'emergency-tool' &&
          block.type === 'heading' &&
          block.level === 3
            ? pagePlan.blocks
                .slice(0, index + 1)
                .filter(
                  (candidate) =>
                    candidate.type === 'heading' && candidate.level === 3,
                ).length
            : undefined
        const templateStateIndex =
          pagePlan.pageTemplate === 'guided-framework' &&
          block.type === 'checkbox-field'
            ? pagePlan.blocks
                .slice(0, index + 1)
                .filter((candidate) => candidate.type === 'checkbox-field').length
            : undefined

        drawStaticBlock(
          page,
          block,
          placement,
          displayFont,
          bodyFont,
          bodyBoldFont,
          pagePlan.pageTemplate,
          templateStepNumber,
          templateStateIndex,
        )
      }
    })

    if (pagePlan.pageNumber !== undefined) {
      const pageNumber = String(pagePlan.pageNumber)
      const width = bodyFont.widthOfTextAtSize(pageNumber, 8)
      page.drawRectangle({
        x: 286,
        y: PUBLICATION_MARGIN_POINTS - 8,
        width: 40,
        height: 0.7,
        color: RULE,
      })
      page.drawText(pageNumber, {
        x: 306 - width / 2,
        y: PUBLICATION_MARGIN_POINTS - 20,
        size: 8,
        font: bodyFont,
        color: MUTED_INK,
      })

      plan.interactiveFields
        .filter((field) => field.pageNumber === pagePlan.pageNumber)
        .forEach((field) => addInteractiveField(document, page, field, bodyFont))
    }
  }

  document.getForm().updateFieldAppearances(bodyFont)

  return document.save()
}

export { toWinAnsiSafeText }
