import type { GentlePageCompilationResult } from './compileGentlePageManuscript'
import { compilePublicationManuscript as compileStrictManuscript } from './compilePublicationManuscript'

const LOWERCASE_TITLE_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'into',
  'nor',
  'of',
  'on',
  'or',
  'the',
  'to',
  'vs',
  'with',
])

function looksLikePlainTextHeading(value: string): boolean {
  const text = value.trim()

  if (!text || text.length < 8 || text.length > 120) return false
  if (/^(?:#{1,6}\s|\[\[GP:|[-*]\s|\d+[.)]\s|\|)/i.test(text)) return false
  if (/[.!?;]$/.test(text)) return false

  const words = text
    .replace(/[(){}“”"']/g, '')
    .split(/\s+/)
    .filter((word) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(word))

  if (words.length < 2 || words.length > 16) return false

  const titleLikeWords = words.filter((word) => {
    const normalized = word.replace(/^[^A-Za-zÀ-ÖØ-öø-ÿ]+|[^A-Za-zÀ-ÖØ-öø-ÿ]+$/g, '')
    if (!normalized) return true
    if (LOWERCASE_TITLE_WORDS.has(normalized.toLowerCase())) return true
    return /^[A-ZÀ-ÖØ-Þ]/.test(normalized) || normalized === normalized.toUpperCase()
  })

  return titleLikeWords.length / words.length >= 0.72
}

function nextNonEmptyLineIndex(lines: string[], start: number): number {
  for (let index = start; index < lines.length; index += 1) {
    if (lines[index]?.trim()) return index
  }
  return -1
}

/**
 * Recovers the common rich-text copy/paste failure where Markdown heading markers are stripped
 * before a manuscript reaches the textarea. Recovery is deliberately conservative: it only runs
 * when there is no Markdown H1 and the first non-empty line strongly resembles a title. The next
 * title-like line is promoted to H2 so it does not get concatenated with opening body copy.
 */
export function recoverPlainTextManuscriptHeadings(manuscript: string): string {
  const normalized = manuscript.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')

  if (lines.some((line) => /^\s*#\s+\S/.test(line))) return normalized

  const titleIndex = nextNonEmptyLineIndex(lines, 0)
  if (titleIndex < 0) return normalized

  const title = lines[titleIndex]?.trim() ?? ''
  if (!looksLikePlainTextHeading(title)) return normalized

  const recovered = [...lines]
  recovered[titleIndex] = `# ${title}`

  const sectionIndex = nextNonEmptyLineIndex(lines, titleIndex + 1)
  if (sectionIndex >= 0) {
    const section = lines[sectionIndex]?.trim() ?? ''
    if (looksLikePlainTextHeading(section)) {
      recovered[sectionIndex] = `## ${section}`
    }
  }

  return recovered.join('\n')
}

export function compilePublicationManuscript(manuscript: string): GentlePageCompilationResult {
  const recoveredManuscript = recoverPlainTextManuscriptHeadings(manuscript)
  const result = compileStrictManuscript(recoveredManuscript)

  if (recoveredManuscript === manuscript.replace(/\r\n?/g, '\n')) {
    return result
  }

  return {
    ...result,
    diagnostics: [
      ...result.diagnostics,
      {
        level: 'info',
        code: 'plain-text-heading-recovery',
        message:
          'Markdown heading markers were missing, so Gentle Page recovered the publication title and opening section from plain text.',
      },
    ],
  }
}
