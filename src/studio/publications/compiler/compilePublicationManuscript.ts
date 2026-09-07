import type { PublicationBlock } from '../types'
import {
  compileGentlePageManuscript as compileBaseManuscript,
  type GentlePageCompilationResult,
} from './compileGentlePageManuscript'
import { parsePublicationTableCell } from './tableCellSemantics'

function normalizeTableCellForOutput(value: string): string {
  const parts = parsePublicationTableCell(value)

  if (!parts.some((part) => part.kind !== 'text')) {
    return value
  }

  return parts
    .map((part) => {
      if (part.kind === 'text') return part.text
      if (part.kind === 'checkbox') return '[ ]'
      return ''
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

function normalizeBlockForOutput(block: PublicationBlock): PublicationBlock {
  if (block.type !== 'table') {
    return block
  }

  return {
    ...block,
    columns: block.columns.map(normalizeTableCellForOutput),
    rows: block.rows.map((row) => row.map(normalizeTableCellForOutput)),
  }
}

/**
 * User-facing compiler entry point.
 *
 * The base parser intentionally preserves unknown source material. This finalization pass removes
 * Gentle Page authoring syntax that has already expressed its intent inside structured table cells
 * so protocol text can never leak into Preview, static PDF, or fillable PDF output.
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
