import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib'

import type { Publication, PublicationBlock } from '../types'
import { parsePublicationTable } from '../utils/parsePublicationTable'
import {
  createPublicationPdfPlan,
  PUBLICATION_MARGIN_POINTS,
  type PublicationPdfBlockPlacement,
  type PublicationPdfInteractiveField,
} from './publicationPdfPlan'

const INK = rgb(0.12, 0.15, 0.13)
const MUTED_INK = rgb(0.35, 0.4, 0.37)
const RULE = rgb(0.78, 0.82, 0.8)
const TABLE_HEADER = rgb(0.95, 0.96, 0.95)
const PAPER = rgb(1, 1, 1)

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
): void {
  const lines = wrapText(text, font, size, maxWidth)
  const maxLines = maxHeight ? Math.max(1, Math.floor(maxHeight / lineHeight)) : lines.length

  lines.slice(0, maxLines).forEach((line, index) => {
    page.drawText(line, {
      x,
      y: top - size - index * lineHeight,
      size,
      font,
      color: INK,
    })
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
  const brandSize = 10
  const brandWidth = bodyFont.widthOfTextAtSize(brand, brandSize)

  page.drawText(brand, {
    x: centerX - brandWidth / 2,
    y: 710,
    size: brandSize,
    font: bodyFont,
    color: MUTED_INK,
  })

  const titleLines = wrapText(publication.title, displayFont, 28, 430)
  const titleLineHeight = 34
  const titleStartY = 430 + ((titleLines.length - 1) * titleLineHeight) / 2

  titleLines.forEach((line, index) => {
    const width = displayFont.widthOfTextAtSize(line, 28)
    page.drawText(line, {
      x: centerX - width / 2,
      y: titleStartY - index * titleLineHeight,
      size: 28,
      font: displayFont,
      color: INK,
    })
  })

  if (publication.description) {
    const descriptionLines = wrapText(publication.description, bodyFont, 12, 380)
    const descriptionStartY = titleStartY - titleLines.length * titleLineHeight - 24

    descriptionLines.slice(0, 5).forEach((line, index) => {
      const width = bodyFont.widthOfTextAtSize(line, 12)
      page.drawText(line, {
        x: centerX - width / 2,
        y: descriptionStartY - index * 18,
        size: 12,
        font: bodyFont,
        color: MUTED_INK,
      })
    })
  }

  const tagline = 'Thoughtfully designed tools for everyday clarity.'
  const taglineWidth = bodyFont.widthOfTextAtSize(tagline, 10)
  page.drawText(tagline, {
    x: centerX - taglineWidth / 2,
    y: 70,
    size: 10,
    font: bodyFont,
    color: MUTED_INK,
  })
}

function drawTable(
  page: PDFPage,
  block: Extract<PublicationBlock, { type: 'table' }>,
  placement: PublicationPdfBlockPlacement,
  bodyFont: PDFFont,
  bodyBoldFont: PDFFont,
): void {
  const table = parsePublicationTable(block.text)
  const allRows = table.headers.length > 0 ? [table.headers, ...table.rows] : table.rows
  if (allRows.length === 0) return

  const columnCount = Math.max(table.headers.length, ...table.rows.map((row) => row.length), 1)
  const columnWidth = placement.rect.width / columnCount
  const rowHeight = placement.rect.height / allRows.length

  allRows.forEach((row, rowIndex) => {
    const y = placement.rect.y + placement.rect.height - (rowIndex + 1) * rowHeight
    const isHeader = table.headers.length > 0 && rowIndex === 0

    row.forEach((cell, cellIndex) => {
      const x = placement.rect.x + cellIndex * columnWidth
      page.drawRectangle({
        x,
        y,
        width: columnWidth,
        height: rowHeight,
        color: isHeader ? TABLE_HEADER : PAPER,
        borderColor: RULE,
        borderWidth: 0.7,
      })

      drawWrappedText(
        page,
        cell,
        isHeader ? bodyBoldFont : bodyFont,
        8.5,
        x + 5,
        y + rowHeight - 4,
        Math.max(10, columnWidth - 10),
        11,
        Math.max(10, rowHeight - 8),
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
    const size = block.level === 1 ? 20 : block.level === 2 ? 16 : 13
    const lineHeight = size * 1.2
    drawWrappedText(
      page,
      block.text || 'Untitled heading',
      displayFont,
      size,
      placement.rect.x,
      top,
      placement.rect.width,
      lineHeight,
      placement.rect.height,
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

  if (block.type === 'table') {
    drawTable(page, block, placement, bodyFont, bodyBoldFont)
    return
  }

  if (block.type === 'multiline-text-field' || block.type === 'rating-field') {
    drawWrappedText(
      page,
      block.text || (block.type === 'rating-field' ? 'Rating' : 'Response'),
      bodyBoldFont,
      11,
      placement.rect.x,
      top,
      placement.rect.width,
      14,
      28,
    )
    return
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
}

function addRatingField(
  document: PDFDocument,
  page: PDFPage,
  field: PublicationPdfInteractiveField,
  bodyFont: PDFFont,
): void {
  const options = field.options ?? []
  if (options.length === 0) return

  const radioGroup = document.getForm().createRadioGroup(field.name)
  const columns = Math.min(options.length, 11)
  const cellWidth = field.rect.width / columns
  const rowHeight = 24
  const radioSize = 10
  const top = field.rect.y + field.rect.height

  options.forEach((option, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = field.rect.x + column * cellWidth
    const y = top - (row + 1) * rowHeight

    radioGroup.addOptionToPage(option, page, {
      x,
      y: y + 7,
      width: radioSize,
      height: radioSize,
      backgroundColor: PAPER,
      borderColor: INK,
      borderWidth: 1,
    })

    page.drawText(toWinAnsiSafeText(option), {
      x: x + radioSize + 4,
      y: y + 7,
      size: 8,
      font: bodyFont,
      color: MUTED_INK,
    })
  })
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
      backgroundColor: PAPER,
      borderColor: RULE,
      borderWidth: 1,
    })
    return
  }

  if (field.kind === 'rating') {
    addRatingField(document, page, field, bodyFont)
    return
  }

  const checkBox = form.createCheckBox(field.name)
  checkBox.addToPage(page, {
    ...field.rect,
    backgroundColor: PAPER,
    borderColor: INK,
    borderWidth: 1,
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

    if (pagePlan.kind === 'cover') {
      drawCover(page, publication, displayFont, bodyFont)
      continue
    }

    pagePlan.blocks.forEach((block, index) => {
      const placement = pagePlan.blockPlacements[index]

      if (placement) {
        drawStaticBlock(page, block, placement, displayFont, bodyFont, bodyBoldFont)
      }
    })

    if (pagePlan.pageNumber !== undefined) {
      const pageNumber = String(pagePlan.pageNumber)
      const width = bodyFont.widthOfTextAtSize(pageNumber, 9)
      page.drawText(pageNumber, {
        x: 306 - width / 2,
        y: PUBLICATION_MARGIN_POINTS - 18,
        size: 9,
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
