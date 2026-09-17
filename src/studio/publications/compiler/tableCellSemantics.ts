import type { PublicationResponseSizeIntent } from '../types'

export type PublicationTableCellPart =
  | { kind: 'text'; text: string }
  | { kind: 'response'; size: PublicationResponseSizeIntent }
  | { kind: 'checkbox'; label?: string }

const TOKEN_PATTERN = /(\[\[GP:RESPONSE(?:\s+size\s*=\s*["']?([^"'\]\s]+)["']?)?\]\]|(?:-\s*)?\[\s?\])/gi

function normalizeResponseSize(value: string | undefined): PublicationResponseSizeIntent {
  switch (value?.toLowerCase()) {
    case 'short':
      return 'short'
    case 'medium':
      return 'medium'
    case 'long':
    default:
      return 'long'
  }
}

/**
 * Remove authoring-only inline syntax that must never reach reader-facing output.
 *
 * The publication model does not currently carry rich-text spans, so emphasis markers are
 * intentionally collapsed to their visible text while HTML break tags are preserved as semantic
 * newlines. This keeps Preview, print/static PDF, and fillable PDF on the same clean text model.
 */
export function normalizeReaderFacingText(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

export function parsePublicationTableCell(value: string): PublicationTableCellPart[] {
  const parts: PublicationTableCellPart[] = []
  let cursor = 0

  for (const match of value.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0
    const preceding = normalizeReaderFacingText(value.slice(cursor, index))

    if (preceding) {
      parts.push({ kind: 'text', text: preceding })
    }

    if (/^\[\[GP:RESPONSE/i.test(match[0])) {
      parts.push({ kind: 'response', size: normalizeResponseSize(match[2]) })
    } else {
      parts.push({ kind: 'checkbox' })
    }

    cursor = index + match[0].length
  }

  const trailing = normalizeReaderFacingText(value.slice(cursor))
  if (trailing) {
    parts.push({ kind: 'text', text: trailing })
  }

  if (parts.length === 0) {
    const normalized = normalizeReaderFacingText(value)
    return normalized ? [{ kind: 'text', text: normalized }] : []
  }

  return parts
}

export function tableCellHasInteractiveIntent(value: string): boolean {
  return parsePublicationTableCell(value).some(
    (part) => part.kind === 'response' || part.kind === 'checkbox',
  )
}

export function tableCellStaticText(value: string): string {
  return parsePublicationTableCell(value)
    .filter((part): part is Extract<PublicationTableCellPart, { kind: 'text' }> => part.kind === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim()
}
