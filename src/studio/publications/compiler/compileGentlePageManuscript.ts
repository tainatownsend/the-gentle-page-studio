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
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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

function parsePageBreakIntent(line: string): PublicationPageBreakIntent {
  const typeMatch = line.match(/type\s*=\s*["']?(preferred|forced)["']?/i)
  return typeMatch?.[1]?.toLowerCase() === 'forced' ? 'forced' : 'preferred'
}

function parseNumericAttribute(line: string, attribute: string): number | undefined {
  const match = line.match(new RegExp(`${attribute}\\s*=\\s*["']?(-?\\d+(?:\\.\\d+)?)["']?`, 'i'))
  if (!match?.[1]) return undefined

  const value = Number(match[1])
  return Number.isFinite(value) ? value : undefined
}

function withPendingLayout(
  block: PublicationBlock,
  pendingPageBreak: PublicationPageBreakIntent | undefined,
): PublicationBlock {
  if (!pendingPageBreak) {
    return block
  }

  return {
    ...block,
    layout: {
      ...block.layout,
      pageBreakBefore: pendingPageBreak,
    },
  }
}

function isPromptLikeBlock(block: PublicationBlock | undefined): boolean {
  if (!block) return false
  if (block.type === 'heading' && block.level === 3) return true
  return block.type === 'paragraph' && /[?:]$/.test(block.text.trim())
}

function isMarkdownTable(lines: readonly string[]): boolean {
  if (lines.length < 2) return false

  const tableRows = lines.every((line) => /^\|.*\|$/.test(line.trim()))
  const separatorCells = lines[1]
    ?.trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())

  return (
    tableRows &&
    (separatorCells?.length ?? 0) > 0 &&
    separatorCells?.every((cell) => /^:?-{3,}:?$/.test(cell)) === true
  )
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

  function consumePendingPageBreak(): PublicationPageBreakIntent | undefined {
    const value = pendingPageBreak
    pendingPageBreak = undefined
    return value
  }

  function pushBlock(block: PublicationBlock) {
    blocks.push(withPendingLayout(block, consumePendingPageBreak()))
  }

  function flushParagraph() {
    const rawLines = paragraphLines.map((line) => line.trim()).filter(Boolean)
    paragraphLines = []

    if (rawLines.length === 0) return

    if (isMarkdownTable(rawLines)) {
      pushBlock({
        id: createBlockId(),
        type: 'table',
        text: rawLines.join('\n'),
      })
      return
    }

    const text = rawLines.join(' ').replace(/\s+/g, ' ').trim()
    if (!text) return

    pushBlock({
      id: createBlockId(),
      type: 'paragraph',
      text,
    })
  }

  function consumePrompt(defaultPrompt: string): {
    prompt: string
    inheritedPageBreak?: PublicationPageBreakIntent
  } {
    const previousBlock = blocks[blocks.length - 1]

    if (!isPromptLikeBlock(previousBlock)) {
      return { prompt: defaultPrompt }
    }

    const removed = blocks.pop()
    if (!removed) return { prompt: defaultPrompt }

    return {
      prompt: removed.text,
      inheritedPageBreak: removed.layout?.pageBreakBefore,
    }
  }

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = rawLine.trim()

    if (/^\[\[GP:/i.test(line)) {
      detectedProtocol = true
    }

    if (/^\[\[GP:AUTHOR_NOTE\]\]$/i.test(line)) {
      flushParagraph()
      authorNote = true
      return
    }

    if (authorNote) {
      if (/^\[\[GP:END\]\]$/i.test(line)) {
        authorNote = false
      }
      return
    }

    if (!line) {
      flushParagraph()
      return
    }

    if (/^\[\[GP:PAGE_BREAK(?:\s+[^\]]+)?\]\]$/i.test(line)) {
      flushParagraph()
      pendingPageBreak = parsePageBreakIntent(line)
      return
    }

    const responseMatch = line.match(
      /^\[\[GP:RESPONSE(?:\s+size\s*=\s*["']?([^"'\]\s]+)["']?)?\]\]$/i,
    )
    if (responseMatch) {
      flushParagraph()
      const { prompt, inheritedPageBreak } = consumePrompt('Response')
      const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
      pendingPageBreak = undefined

      blocks.push({
        id: createBlockId(),
        type: 'multiline-text-field',
        text: prompt,
        responseSize: normalizeResponseSize(responseMatch[1]),
        layout: pageBreakBefore ? { pageBreakBefore } : undefined,
      })
      return
    }

    if (/^\[\[GP:RATING\b[^\]]*\]\]$/i.test(line)) {
      flushParagraph()
      const { prompt, inheritedPageBreak } = consumePrompt('Rating')
      const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
      pendingPageBreak = undefined
      const parsedMin = parseNumericAttribute(line, 'min') ?? 0
      const parsedMax = parseNumericAttribute(line, 'max') ?? 10
      const min = Math.trunc(parsedMin)
      const max = Math.trunc(parsedMax)

      if (min >= max) {
        diagnostics.push({
          level: 'suggestion',
          code: 'rating-range-normalized',
          line: lineNumber,
          message: 'A rating range with min greater than or equal to max was normalized to 0–10.',
        })
      }

      blocks.push({
        id: createBlockId(),
        type: 'rating-field',
        text: prompt,
        min: min < max ? min : 0,
        max: min < max ? max : 10,
        layout: pageBreakBefore ? { pageBreakBefore } : undefined,
      })
      return
    }

    if (/^\[\[GP:/i.test(line)) {
      flushParagraph()
      diagnostics.push({
        level: 'suggestion',
        code: 'unknown-directive',
        line: lineNumber,
        message: `Unknown Gentle Page directive preserved as text: ${line}`,
      })
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

      pushBlock({
        id: createBlockId(),
        type: 'heading',
        level: markdownLevel,
        text,
        layout: {
          keepWithNext: true,
        },
      })
      return
    }

    const checkboxMatch = line.match(/^[-*]\s+\[\s?\]\s+(.+)$/)
    if (checkboxMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'checkbox-field',
        text: checkboxMatch[1].trim(),
      })
      return
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'paragraph',
        text: `• ${bulletMatch[1].trim()}`,
      })
      return
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/)
    if (numberedMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'paragraph',
        text: line,
      })
      return
    }

    paragraphLines.push(line)
  })

  flushParagraph()

  if (authorNote) {
    diagnostics.push({
      level: 'suggestion',
      code: 'unterminated-author-note',
      message:
        'An author-only note was not closed with [[GP:END]]. It was kept out of publication output.',
    })
  }

  if (pendingPageBreak) {
    diagnostics.push({
      level: 'info',
      code: 'trailing-page-break',
      message: 'A trailing page-break directive had no following content and was ignored.',
    })
  }

  return {
    title: title || 'Untitled publication',
    content: { blocks },
    diagnostics,
    detectedProtocol,
  }
}
