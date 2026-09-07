import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib'

import type { Publication, PublicationBlock } from '../types'
import {
  createPublicationPdfPlan,
  PUBLICATION_MARGIN_POINTS,
  type PublicationPdfBlockPlacement,
  type PublicationPdfInteractiveField,
} from './publicationPdfPlan'

const INK = rgb(43 / 255, 48 / 255, 45 / 255)
const MUTED_INK = rgb(107 / 255, 116 / 255, 110 / 255)
const RULE = rgb(215 / 255, 221 / 255, 217 / 255)
const PAPER = rgb(252 / 255, 250 / 255, 246 / 255)
const PAPER_STRONG = rgb(1, 253 / 255, 249 / 255)
const SAGE = rgb(122 / 255, 144 / 255, 128 / 255)
const SAGE_DEEP = rgb(83 / 255, 104 / 255, 91 / 255)
const SAGE_SOFT = rgb(232 / 255, 238 / 255, 233 / 255)
const CLAY = rgb(185 / 255, 133 / 255, 117 / 255)
const SAND_SOFT = rgb(243 / 255, 237 / 255, 223 / 255)
const FIELD = rgb(250 / 255, 247 / 255, 241 / 255)

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

  page.drawRectangle({
    x: PUBLICATION_MARGIN_POINTS,
    y: 724,
    width: 112,
    height: 5,
    color: SAGE,
  })

  page.drawRectangle({
    x: 478,
    y: 68,
    width: 134,
    height: 134,
    color: SAND_SOFT,
    opacity: 0.78,
  })

  page.drawRectangle({
    x: centerX - brandWidth / 2 - 12,
    y: 692,
    width: brandWidth + 24,
    height: 26,
    color: SAGE_SOFT,
  })

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
): void {
  const columnCount = Math.max(block.columns.length, 1)
  const rowCount = block.rows.length + 1
  const columnWidth = placement.rect.width / columnCount
  const captionReserve = block.text ? 22 : 0
  const tableHeight = Math.max(24, placement.rect.height - captionReserve)
  const rowHeight = tableHeight / Math.max(rowCount, 1)
  const tableTop = placement.rect.y + placement.rect.height - captionReserve

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
      captionReserve,
      SAGE_DEEP,
    )
  }

  const allRows = [block.columns, ...block.rows]

  allRows.forEach((row, rowIndex) => {
    const cellTop = tableTop - rowIndex * rowHeight

    block.columns.forEach((_, columnIndex) => {
      const x = placement.rect.x + columnIndex * columnWidth
      const y = cellTop - rowHeight
      const fill = rowIndex === 0 ? SAGE_SOFT : rowIndex % 2 === 0 ? SAND_SOFT : PAPER_STRONG

      page.drawRectangle({
        x,
        y,
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
        x + 5,
        cellTop - 4,
        Math.max(8, columnWidth - 10),
        10.5,
        Math.max(8, rowHeight - 8),
        rowIndex === 0 ? SAGE_DEEP : INK,
      )
    })
  })
}

function drawStaticBlock(
  page: PDFPage,
  block: PublicationBlock,
  placement: PublicationPdfBlockPlacement,
  displayFont: PDFFont,
  bodyFont: PDFFont,
  bodyBoldFont: PDFFont,
): void {
  const top = placement.rect.y + placement.rect.height

  if (block.type === 'heading') {
    if (block.level === 1) {
      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y + 2,
        width: placement.rect.width,
        height: Math.max(placement.rect.height - 4, 18),
        color: SAGE_SOFT,
      })
      page.drawRectangle({
        x: placement.rect.x,
        y: placement.rect.y + 2,
        width: 5,
        height: Math.max(placement.rect.height - 4, 18),
        color: SAGE,
      })
      drawWrappedText(
        page,
        block.text || 'Untitled heading',
        displayFont,
        20,
        placement.rect.x + 14,
        top - 3,
        placement.rect.width - 24,
        24,
        Math.max(placement.rect.height - 8, 20),
        SAGE_DEEP,
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
    drawWrappedText(
      page,
      block.text || 'Empty paragraph',
      bodyFont,
      11,
      placement.rect.x,
      top,
      placement.rect.width,
      15,
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
      color: SAND_SOFT,
      borderColor: RULE,
      borderWidth: 0.5,
    })
    drawWrappedText(
      page,
      block.text || 'Response',
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

  if (block.type === 'checkbox-field') {
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
      color: SAGE_SOFT,
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

  drawTableBlock(page, block, placement, bodyFont, bodyBoldFont)
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

    page.drawRectangle({
      x: PUBLICATION_MARGIN_POINTS,
      y: pagePlan.height - PUBLICATION_MARGIN_POINTS + 8,
      width: 52,
      height: 2.5,
      color: SAGE,
    })

    pagePlan.blocks.forEach((block, index) => {
      const placement = pagePlan.blockPlacements[index]

      if (placement) {
        drawStaticBlock(page, block, placement, displayFont, bodyFont, bodyBoldFont)
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
