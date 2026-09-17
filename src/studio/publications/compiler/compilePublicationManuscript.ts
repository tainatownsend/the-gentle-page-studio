import type { PublicationBlock, PublicationTableCellControl, PublicationTableBlock } from '../types'
import {
  compileGentlePageManuscript as compileBaseManuscript,
  type GentlePageCompilationResult,
} from './compileGentlePageManuscript'
import { normalizeReaderFacingText, parsePublicationTableCell } from './tableCellSemantics'

type NormalizedTableCell = {
  text: string
  controls: PublicationTableCellControl[]
}

function normalizeTableCellForOutput(value: string): NormalizedTableCell {
  const parts = parsePublicationTableCell(value)
  const controls: PublicationTableCellControl[] = []

  for (const part of parts) {
    if (part.kind === 'response') {
      controls.push({ kind: 'response', size: part.size })
      continue
    }

    if (part.kind === 'checkbox') {
      controls.push({ kind: 'checkbox' })
    }
  }

  const text = parts
    .filter((part) => part.kind === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim()

  return { text, controls }
}

function looksLikeTableContinuation(block: PublicationBlock | undefined): block is Extract<PublicationBlock, { type: 'paragraph' }> {
  if (!block || block.type !== 'paragraph') return false
  return /<br\s*\/?\s*>/i.test(block.text) && (/\[\s?\]/.test(block.text) || block.text.includes('|'))
}

function appendTableContinuation(table: PublicationTableBlock, continuation: string): PublicationTableBlock {
  if (table.rows.length === 0 || table.columns.length === 0) return table

  const rows = table.rows.map((row) => table.columns.map((_, index) => row[index] ?? ''))
  let rowIndex = rows.length - 1
  const currentRow = rows[rowIndex] ?? []
  let columnIndex = Math.max(
    1,
    currentRow.reduce((lastNonEmpty, cell, index) => (cell.trim() ? index : lastNonEmpty), 0),
  )

  const segments = continuation.split('|')

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segment = segments[segmentIndex]?.trim() ?? ''
    const row = rows[rowIndex]
    if (!row) break

    if (segment) {
      row[columnIndex] = [row[columnIndex], segment].filter(Boolean).join(' ').trim()
    }

    if (segmentIndex === segments.length - 1) continue

    columnIndex += 1
    if (columnIndex >= table.columns.length) {
      rows.push(table.columns.map(() => ''))
      rowIndex += 1
      columnIndex = 0
    }
  }

  return {
    ...table,
    rows,
  }
}

function repairStructuredTableContinuations(blocks: PublicationBlock[]): PublicationBlock[] {
  const repaired: PublicationBlock[] = []

  for (let index = 0; index < blocks.length; index += 1) {
    let block = blocks[index]

    if (block.type === 'table') {
      while (looksLikeTableContinuation(blocks[index + 1])) {
        block = appendTableContinuation(block, blocks[index + 1].text)
        index += 1
      }
    }

    repaired.push(block)
  }

  return repaired
}

function normalizeBlockForOutput(block: PublicationBlock): PublicationBlock {
  if (block.type === 'table') {
    const normalizedRows = block.rows.map((row) => row.map(normalizeTableCellForOutput))
    const hasCellControls = normalizedRows.some((row) =>
      row.some((cell) => cell.controls.length > 0),
    )

    return {
      ...block,
      text: normalizeReaderFacingText(block.text),
      columns: block.columns.map((cell) => normalizeTableCellForOutput(cell).text),
      rows: normalizedRows.map((row) => row.map((cell) => cell.text)),
      cellControls: hasCellControls
        ? normalizedRows.map((row) => row.map((cell) => cell.controls))
        : undefined,
    }
  }

  return {
    ...block,
    text: normalizeReaderFacingText(block.text),
  }
}

/**
 * User-facing compiler entry point.
 *
 * The base parser intentionally preserves unknown source material. This finalization pass consumes
 * authoring syntax before any customer-facing renderer receives publication content. It also repairs
 * a narrow malformed-Markdown pattern emitted by AI manuscripts where `<br>`-separated table-cell
 * content continues onto physical lines after the first table row. Interaction intent is retained as
 * semantic metadata so Preview, static print/PDF, and fillable PDF all consume the same clean model.
 */
export function compilePublicationManuscript(manuscript: string): GentlePageCompilationResult {
  const result = compileBaseManuscript(manuscript)
  const repairedBlocks = repairStructuredTableContinuations(result.content.blocks)

  return {
    ...result,
    title: normalizeReaderFacingText(result.title),
    content: {
      blocks: repairedBlocks.map(normalizeBlockForOutput),
    },
  }
}
