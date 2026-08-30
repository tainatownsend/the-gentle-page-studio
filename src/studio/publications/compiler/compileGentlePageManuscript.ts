import type {
  PublicationBlock,
  PublicationContent,
  PublicationHeadingLevel,
  PublicationPageBreakIntent,
  PublicationResponseSizeIntent,
} from '../types'

export type GentlePageCompilationDiagnosticLevel = 'info' | 'suggestion'

export type GentlePageCompilationDiagnostic = {
  level: GentlePageCompilationDiagnosticLevel
  code: string
  message: string
  line?: number
}

export type GentlePageCompilationResult = {
  title: string
  content: PublicationContent
  diagnostics: GentlePageCompilationDiagnostic[]
  detectedProtocol: boolean
}

function createBlockId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeResponseSize(value: string | undefined): PublicationResponseSizeIntent {
  switch (value?.toLowerCase()) {
    case 'short': return 'short'
    case 'medium': return 'medium'
    case 'long':
    default: return 'long'
  }
}

function inferredResponseSize(lineCount: number): PublicationResponseSizeIntent {
  if (lineCount <= 1) return 'short'
  if (lineCount === 2) return 'medium'
  return 'long'
}

function parsePageBreakIntent(line: string): PublicationPageBreakIntent {
  const typeMatch = line.match(/type\s*=\s*["']?(preferred|forced)["']?/i)
  return typeMatch?.[1]?.toLowerCase() === 'forced' ? 'forced' : 'preferred'
}

function parseNumericAttribute(line: string, name: string, fallback: number): number {
  const match = line.match(new RegExp(`${name}\\s*=\\s*["']?(-?\\d+(?:\\.\\d+)?)["']?`, 'i'))
  const value = match ? Number(match[1]) : fallback
  return Number.isFinite(value) ? value : fallback
}

function createRatingScaleText(min: number, max: number): string {
  const safeMin = Math.ceil(Math.min(min, max))
  const safeMax = Math.floor(Math.max(min, max))
  if (safeMax - safeMin > 20) return `${safeMin}  ·  ·  ·  ${safeMax}`
  return Array.from({ length: safeMax - safeMin + 1 }, (_, index) => safeMin + index).join('   ')
}

function withPendingLayout(
  block: PublicationBlock,
  pendingPageBreak: PublicationPageBreakIntent | undefined,
): PublicationBlock {
  if (!pendingPageBreak) return block
  return { ...block, layout: { ...block.layout, pageBreakBefore: pendingPageBreak } }
}

function isPromptLikeBlock(block: PublicationBlock | undefined): boolean {
  if (!block) return false
  if (block.type === 'heading' && block.level === 3) return true
  return block.type === 'paragraph' && /[?:]$/.test(block.text.trim())
}

function isLikelyInferredWritingPrompt(block: PublicationBlock | undefined): boolean {
  if (isPromptLikeBlock(block)) return true
  return block?.type === 'paragraph' && block.text.trim().length <= 120
}

function isWritingAreaLine(line: string): boolean {
  return /^_{3,}$/.test(line)
}

function isMarkdownTableLine(line: string): boolean {
  return /^\|.*\|$/.test(line)
}

function normalizeInlineFieldPrompt(value: string): string {
  return value.trim().replace(/\s+$/, '').replace(/:\s*$/, '')
}

const PLAIN_SECTION_PREFIX = /^(PHASE|DAY|WEEK|ANALYSIS|REPEATABLE PAGE|CURRENT-STATE|CURRENT STATE|BEFORE YOU BEGIN|REFLECTION|SUMMARY|REVIEW)\b/

function isConservativePlainHeading(line: string): boolean {
  if (line.length < 3 || line.length > 80 || !/[A-Z]/.test(line) || /[a-z]/.test(line)) return false
  return PLAIN_SECTION_PREFIX.test(line)
}

function isLikelyPlainTitle(line: string): boolean {
  if (line.length < 4 || line.length > 100 || PLAIN_SECTION_PREFIX.test(line) || /[a-z]/.test(line)) return false
  return (line.match(/[A-Z][A-Z0-9'’&-]*/g) ?? []).length >= 2
}

export function compileGentlePageManuscript(manuscript: string): GentlePageCompilationResult {
  const lines = manuscript.replace(/\r\n?/g, '\n').split('\n')
  const blocks: PublicationBlock[] = []
  const diagnostics: GentlePageCompilationDiagnostic[] = []
  let title = ''
  let detectedProtocol = false
  let authorNote = false
  let pendingPageBreak: PublicationPageBreakIntent | undefined
  let paragraphLines: string[] = []
  let tableLines: string[] = []
  let inferredResponseBlockId: string | undefined
  let inferredResponseLineCount = 0

  function resetInferredWritingArea() {
    inferredResponseBlockId = undefined
    inferredResponseLineCount = 0
  }

  function consumePendingPageBreak(): PublicationPageBreakIntent | undefined {
    const value = pendingPageBreak
    pendingPageBreak = undefined
    return value
  }

  function pushBlock(block: PublicationBlock) {
    blocks.push(withPendingLayout(block, consumePendingPageBreak()))
  }

  function flushParagraph() {
    const text = paragraphLines.join(' ').replace(/\s+/g, ' ').trim()
    paragraphLines = []
    if (!text) return
    pushBlock({ id: createBlockId(), type: 'paragraph', text })
  }

  function flushTable() {
    if (tableLines.length === 0) return
    const text = tableLines.join('\n')
    tableLines = []
    pushBlock({ id: createBlockId(), type: 'paragraph', text, format: 'table' })
  }

  function flushText() {
    flushTable()
    flushParagraph()
  }

  function inferWritingArea() {
    flushText()
    const previousBlock = blocks[blocks.length - 1]
    if (
      inferredResponseBlockId &&
      previousBlock?.id === inferredResponseBlockId &&
      previousBlock.type === 'multiline-text-field'
    ) {
      inferredResponseLineCount += 1
      previousBlock.responseSize = inferredResponseSize(inferredResponseLineCount)
      return
    }

    let prompt = 'Response'
    let inheritedPageBreak: PublicationPageBreakIntent | undefined
    if (isLikelyInferredWritingPrompt(previousBlock)) {
      const removed = blocks.pop()
      if (removed) {
        prompt = removed.text
        inheritedPageBreak = removed.layout?.pageBreakBefore
      }
    }

    const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
    pendingPageBreak = undefined
    const id = createBlockId()
    blocks.push({
      id,
      type: 'multiline-text-field',
      text: prompt,
      responseSize: 'short',
      layout: pageBreakBefore ? { pageBreakBefore } : undefined,
    })
    inferredResponseBlockId = id
    inferredResponseLineCount = 1
  }

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = rawLine.trim()

    if (/^\[\[GP:/i.test(line)) detectedProtocol = true

    if (/^\[\[GP:AUTHOR_NOTE\]\]$/i.test(line)) {
      flushText()
      resetInferredWritingArea()
      authorNote = true
      return
    }

    if (authorNote) {
      if (/^\[\[GP:END\]\]$/i.test(line)) authorNote = false
      return
    }

    if (!line) {
      flushText()
      return
    }

    if (isMarkdownTableLine(line)) {
      flushParagraph()
      tableLines.push(line)
      return
    }

    flushTable()

    if (!title && blocks.length === 0 && paragraphLines.length === 0 && !detectedProtocol && isLikelyPlainTitle(line)) {
      title = line
      return
    }

    if (isWritingAreaLine(line)) {
      inferWritingArea()
      return
    }

    const inlineFieldMatch = line.match(/^(.+?)\s+_{3,}$/)
    if (inlineFieldMatch) {
      flushParagraph()
      resetInferredWritingArea()
      pushBlock({ id: createBlockId(), type: 'multiline-text-field', text: normalizeInlineFieldPrompt(inlineFieldMatch[1]), responseSize: 'short' })
      return
    }

    resetInferredWritingArea()

    if (/^\[\[GP:PAGE_BREAK(?:\s+[^\]]+)?\]\]$/i.test(line)) {
      flushParagraph()
      pendingPageBreak = parsePageBreakIntent(line)
      return
    }

    if (/^\[\[GP:REPEATABLE_PAGE\b/i.test(line)) {
      flushParagraph()
      pendingPageBreak = pendingPageBreak ?? 'preferred'
      return
    }

    if (/^\[\[GP:END_REPEATABLE_PAGE\]\]$/i.test(line)) {
      flushParagraph()
      return
    }

    const responseMatch = line.match(/^\[\[GP:RESPONSE(?:\s+size\s*=\s*["']?([^"'\]\s]+)["']?)?\]\]$/i)
    if (responseMatch) {
      flushParagraph()
      const previousBlock = blocks[blocks.length - 1]
      let prompt = 'Response'
      let inheritedPageBreak: PublicationPageBreakIntent | undefined
      if (isPromptLikeBlock(previousBlock)) {
        const removed = blocks.pop()
        if (removed) {
          prompt = removed.text
          inheritedPageBreak = removed.layout?.pageBreakBefore
        }
      }
      const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
      pendingPageBreak = undefined
      blocks.push({ id: createBlockId(), type: 'multiline-text-field', text: prompt, responseSize: normalizeResponseSize(responseMatch[1]), layout: pageBreakBefore ? { pageBreakBefore } : undefined })
      return
    }

    if (/^\[\[GP:RATING\b/i.test(line)) {
      flushParagraph()
      const min = parseNumericAttribute(line, 'min', 0)
      const max = parseNumericAttribute(line, 'max', 10)
      pushBlock({ id: createBlockId(), type: 'paragraph', text: createRatingScaleText(min, max), format: 'rating-scale' })
      diagnostics.push({ level: 'info', code: 'rating-static-scale', line: lineNumber, message: 'The rating directive was rendered as a printable scale; dedicated fillable rating controls are still pending.' })
      return
    }

    if (/^\[\[GP:/i.test(line)) {
      flushParagraph()
      diagnostics.push({ level: 'suggestion', code: 'unknown-directive', line: lineNumber, message: `Unknown Gentle Page directive preserved as text: ${line}` })
      paragraphLines.push(line)
      flushParagraph()
      return
    }

    const headingMatch = rawLine.match(/^\s*(#{1,3})\s+(.+?)\s*$/)
    if (headingMatch) {
      flushParagraph()
      const markdownLevel = headingMatch[1].length as PublicationHeadingLevel
      const text = headingMatch[2].trim()
      if (markdownLevel === 1 && !title) {
        title = text
        return
      }
      pushBlock({ id: createBlockId(), type: 'heading', level: markdownLevel, text, layout: { keepWithNext: true } })
      return
    }

    const checkboxMatch = line.match(/^(?:[-*]\s*)?(?:\[\s?\]|☐|□)\s+(.+)$/)
    if (checkboxMatch) {
      flushParagraph()
      pushBlock({ id: createBlockId(), type: 'checkbox-field', text: checkboxMatch[1].trim() })
      return
    }

    if (isConservativePlainHeading(line)) {
      flushParagraph()
      pushBlock({ id: createBlockId(), type: 'heading', level: 2, text: line, layout: { keepWithNext: true } })
      return
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      flushParagraph()
      pushBlock({ id: createBlockId(), type: 'paragraph', text: `• ${bulletMatch[1].trim()}` })
      return
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/)
    if (numberedMatch) {
      flushParagraph()
      pushBlock({ id: createBlockId(), type: 'paragraph', text: line })
      return
    }

    paragraphLines.push(line)
  })

  flushText()

  if (authorNote) diagnostics.push({ level: 'suggestion', code: 'unterminated-author-note', message: 'An author-only note was not closed with [[GP:END]]. It was kept out of publication output.' })
  if (pendingPageBreak) diagnostics.push({ level: 'info', code: 'trailing-page-break', message: 'A trailing page-break directive had no following content and was ignored.' })

  return { title: title || 'Untitled publication', content: { blocks }, diagnostics, detectedProtocol }
}
