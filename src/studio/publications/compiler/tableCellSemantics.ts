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

export function parsePublicationTableCell(value: string): PublicationTableCellPart[] {
  const parts: PublicationTableCellPart[] = []
  let cursor = 0

  for (const match of value.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0
    const preceding = value.slice(cursor, index).trim()

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

  const trailing = value.slice(cursor).trim()
  if (trailing) {
    parts.push({ kind: 'text', text: trailing })
  }

  if (parts.length === 0 && value.trim()) {
    return [{ kind: 'text', text: value.trim() }]
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
