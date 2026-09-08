import type { PublicationBlock, PublicationTableCellControl } from '../types'
import {
  compileGentlePageManuscript as compileBaseManuscript,
  type GentlePageCompilationResult,
} from './compileGentlePageManuscript'
import { parsePublicationTableCell } from './tableCellSemantics'

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

  if (controls.length === 0) {
    return { text: value, controls }
  }

  const text = parts
    .filter((part) => part.kind === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim()

  return { text, controls }
}

function normalizeBlockForOutput(block: PublicationBlock): PublicationBlock {
  if (block.type !== 'table') {
    return block
  }

  const normalizedRows = block.rows.map((row) => row.map(normalizeTableCellForOutput))
  const hasCellControls = normalizedRows.some((row) =>
    row.some((cell) => cell.controls.length > 0),
  )

  return {
    ...block,
    columns: block.columns.map((cell) => normalizeTableCellForOutput(cell).text),
    rows: normalizedRows.map((row) => row.map((cell) => cell.text)),
    cellControls: hasCellControls
      ? normalizedRows.map((row) => row.map((cell) => cell.controls))
      : undefined,
  }
}

/**
 * User-facing compiler entry point.
 *
 * The base parser intentionally preserves unknown source material. This finalization pass consumes
 * Gentle Page authoring syntax that has already expressed its intent inside structured table cells.
 * Reader-facing text is cleaned while interaction intent is retained as semantic metadata so static
 * and fillable output can render the same worksheet without exposing compiler source syntax.
 */
export function compilePublicationManuscript(manuscript: string): GentlePageCompilationResult {
  const result = compileBaseManuscript(manuscript)

  return {
    ...result,
    content: {
      blocks: result.content.blocks.map(normalizeBlockForOutput),
    },
  }
}
