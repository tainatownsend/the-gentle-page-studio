import type { PublicationBlock, PublicationTableCellControl } from '../types'
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

  return { text: text || normalizeReaderFacingText(value), controls }
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
 * authoring syntax before any customer-facing renderer receives publication content. Structured table
 * interaction intent is retained as semantic metadata, while reader-facing text is normalized once in
 * the shared model so Preview, static print/PDF, and fillable PDF cannot diverge on source cleanup.
 */
export function compilePublicationManuscript(manuscript: string): GentlePageCompilationResult {
  const result = compileBaseManuscript(manuscript)

  return {
    ...result,
    title: normalizeReaderFacingText(result.title),
    content: {
      blocks: result.content.blocks.map(normalizeBlockForOutput),
    },
  }
}
