import type {
  PublicationBlock,
  PublicationContent,
  PublicationHeadingLevel,
  PublicationPageBreakIntent,
  PublicationPageTemplate,
  PublicationResponseSizeIntent,
  PublicationSemanticGroup,
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

function createSemanticGroupId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `group-${globalThis.crypto.randomUUID()}`
  }

  return `group-${Date.now()}-${Math.random().toString(16).slice(2)}`
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

const PUBLICATION_PAGE_TEMPLATES: readonly PublicationPageTemplate[] = [
  'navigation',
  'section-opener',
  'prompt-writing',
  'daily-check-in',
  'emergency-tool',
  'weekly-reset',
  'planner-tracker',
  'matrix-framework',
  'closing',
]

function parsePageBreakIntent(line: string): PublicationPageBreakIntent {
  const typeMatch = line.match(/type\s*=\s*["']?(preferred|forced)["']?/i)
  return typeMatch?.[1]?.toLowerCase() === 'forced' ? 'forced' : 'preferred'
}

function parsePageTemplate(line: string): PublicationPageTemplate | undefined {
  const typeMatch = line.match(/type\s*=\s*["']?([^"'\]\s]+)["']?/i)
  const value = typeMatch?.[1]?.toLowerCase() as PublicationPageTemplate | undefined

  return value && PUBLICATION_PAGE_TEMPLATES.includes(value) ? value : undefined
}

function parseNumericAttribute(line: string, name: string): number | undefined {
  const match = line.match(new RegExp(`${name}\\s*=\\s*["']?(-?\\d+(?:\\.\\d+)?)["']?`, 'i'))
  if (!match) return undefined

  const value = Number(match[1])
  return Number.isFinite(value) ? value : undefined
}

function parseTextAttribute(line: string, name: string): string | undefined {
  const quotedMatch = line.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
  return quotedMatch?.[1]?.trim() || undefined
}

function withPendingLayout(
  block: PublicationBlock,
  pendingPageBreak: PublicationPageBreakIntent | undefined,
  pendingPageTemplate: PublicationPageTemplate | undefined,
): PublicationBlock {
  if (!pendingPageBreak && !pendingPageTemplate) {
    return block
  }

  return {
    ...block,
    layout: {
      ...block.layout,
      ...(pendingPageBreak ? { pageBreakBefore: pendingPageBreak } : {}),
      ...(pendingPageTemplate ? { pageTemplate: pendingPageTemplate } : {}),
    },
  }
}

function isPromptLikeBlock(block: PublicationBlock | undefined): boolean {
  if (!block) return false
  if (block.type === 'heading' && block.level === 3) return true
  return block.type === 'paragraph' && /[?:]$/.test(block.text.trim())
}

function parseMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells: string[] = []
  let current = ''
  let escaping = false

  for (const character of trimmed) {
    if (escaping) {
      current += character
      escaping = false
      continue
    }

    if (character === '\\') {
      escaping = true
      continue
    }

    if (character === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  if (escaping) {
    current += '\\'
  }

  cells.push(current.trim())
  return cells
}

function isMarkdownTableSeparator(line: string): boolean {
  const cells = parseMarkdownTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function isMarkdownTableRow(line: string): boolean {
  return line.includes('|') && parseMarkdownTableRow(line).length >= 2
}

function inferSemanticGroups(blocks: PublicationBlock[]): void {
  for (const block of blocks) {
    if (
      !block.semanticGroup &&
      (block.type === 'multiline-text-field' || block.type === 'rating-field')
    ) {
      block.semanticGroup = {
        id: createSemanticGroupId(),
        kind: 'prompt-response',
        name: block.text || 'Prompt and response',
      }
    }
  }

  let index = 0
  while (index < blocks.length) {
    if (blocks[index]?.type !== 'checkbox-field' || blocks[index]?.semanticGroup) {
      index += 1
      continue
    }

    let end = index + 1
    while (end < blocks.length && blocks[end]?.type === 'checkbox-field' && !blocks[end]?.semanticGroup) {
      end += 1
    }

    const group: PublicationSemanticGroup = {
      id: createSemanticGroupId(),
      kind: 'checkbox-group',
      name: 'Checkbox group',
    }
    for (let cursor = index; cursor < end; cursor += 1) {
      const block = blocks[cursor]
      if (block) block.semanticGroup = { ...group }
    }
    index = end
  }
}

export function compileGentlePageManuscript(manuscript: string): GentlePageCompilationResult {
  const lines = manuscript.replace(/\r\n?/g, '\n').split('\n')
  const blocks: PublicationBlock[] = []
  const diagnostics: GentlePageCompilationDiagnostic[] = []
  let title = ''
  let detectedProtocol = false
  let authorNote = false
  let pendingPageBreak: PublicationPageBreakIntent | undefined
  let pendingPageTemplate: PublicationPageTemplate | undefined
  let paragraphLines: string[] = []
  let activeSemanticGroup: PublicationSemanticGroup | undefined
  let activeSemanticGroupHasContent = false

  function consumePendingPageBreak(): PublicationPageBreakIntent | undefined {
    const value = pendingPageBreak
    pendingPageBreak = undefined
    return value
  }

  function consumePendingPageTemplate(): PublicationPageTemplate | undefined {
    const value = pendingPageTemplate
    pendingPageTemplate = undefined
    return value
  }

  function pushBlock(block: PublicationBlock) {
    const withLayout = withPendingLayout(
      block,
      consumePendingPageBreak(),
      consumePendingPageTemplate(),
    )
    const groupedBlock = activeSemanticGroup
      ? {
          ...withLayout,
          semanticGroup: { ...activeSemanticGroup },
        }
      : withLayout

    blocks.push(groupedBlock)

    if (activeSemanticGroup) {
      activeSemanticGroupHasContent = true
    }
  }

  function flushParagraph() {
    const text = paragraphLines.join(' ').replace(/\s+/g, ' ').trim()
    paragraphLines = []

    if (!text) return

    pushBlock({
      id: createBlockId(),
      type: 'paragraph',
      text,
    })
  }

  let index = 0

  while (index < lines.length) {
    const rawLine = lines[index] ?? ''
    const lineNumber = index + 1
    const line = rawLine.trim()

    if (/^\[\[GP:/i.test(line)) {
      detectedProtocol = true
    }

    if (/^\[\[GP:AUTHOR_NOTE\]\]$/i.test(line)) {
      flushParagraph()
      authorNote = true
      index += 1
      continue
    }

    if (authorNote) {
      if (/^\[\[GP:END\]\]$/i.test(line)) {
        authorNote = false
      }
      index += 1
      continue
    }

    const repeatableStartMatch = line.match(/^\[\[GP:REPEATABLE_PAGE(?:\s+[^\]]+)?\]\]$/i)
    if (repeatableStartMatch) {
      flushParagraph()

      if (activeSemanticGroup) {
        diagnostics.push({
          level: 'suggestion',
          code: 'nested-repeatable-page',
          line: lineNumber,
          message: 'A repeatable page started before the previous one ended. The previous group was closed automatically.',
        })
      }

      activeSemanticGroup = {
        id: createSemanticGroupId(),
        kind: 'repeatable-page',
        name: parseTextAttribute(line, 'name') ?? 'Repeatable page',
      }
      activeSemanticGroupHasContent = false
      index += 1
      continue
    }

    if (/^\[\[GP:END_REPEATABLE_PAGE\]\]$/i.test(line)) {
      flushParagraph()

      if (!activeSemanticGroup) {
        diagnostics.push({
          level: 'suggestion',
          code: 'unmatched-repeatable-page-end',
          line: lineNumber,
          message: 'A repeatable-page end marker had no matching start marker and was ignored.',
        })
      } else if (!activeSemanticGroupHasContent) {
        diagnostics.push({
          level: 'suggestion',
          code: 'empty-repeatable-page',
          line: lineNumber,
          message: `Repeatable page “${activeSemanticGroup.name}” contains no publication content.`,
        })
      }

      activeSemanticGroup = undefined
      activeSemanticGroupHasContent = false
      index += 1
      continue
    }

    if (!line) {
      flushParagraph()
      index += 1
      continue
    }

    if (/^\[\[GP:PAGE_BREAK(?:\s+[^\]]+)?\]\]$/i.test(line)) {
      flushParagraph()
      pendingPageBreak = parsePageBreakIntent(line)
      index += 1
      continue
    }

    if (/^\[\[GP:PAGE_TEMPLATE(?:\s+[^\]]+)?\]\]$/i.test(line)) {
      flushParagraph()
      const pageTemplate = parsePageTemplate(line)

      if (pageTemplate) {
        pendingPageTemplate = pageTemplate
      } else {
        diagnostics.push({
          level: 'suggestion',
          code: 'invalid-page-template',
          line: lineNumber,
          message: 'An unsupported page template was ignored. Use one of the documented Gentle Page page-template values.',
        })
      }

      index += 1
      continue
    }

    const responseMatch = line.match(
      /^\[\[GP:RESPONSE(?:\s+size\s*=\s*["']?([^"'\]\s]+)["']?)?\]\]$/i,
    )
    if (responseMatch) {
      flushParagraph()
      const previousBlock = blocks[blocks.length - 1]
      let prompt = 'Response'
      let inheritedPageBreak: PublicationPageBreakIntent | undefined
      let inheritedPageTemplate: PublicationPageTemplate | undefined

      if (isPromptLikeBlock(previousBlock)) {
        const removed = blocks.pop()
        if (removed) {
          prompt = removed.text
          inheritedPageBreak = removed.layout?.pageBreakBefore
          inheritedPageTemplate = removed.layout?.pageTemplate
        }
      }

      const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
      const pageTemplate = pendingPageTemplate ?? inheritedPageTemplate
      pendingPageBreak = undefined
      pendingPageTemplate = undefined

      pushBlock({
        id: createBlockId(),
        type: 'multiline-text-field',
        text: prompt,
        responseSize: normalizeResponseSize(responseMatch[1]),
        layout:
          pageBreakBefore || pageTemplate
            ? {
                ...(pageBreakBefore ? { pageBreakBefore } : {}),
                ...(pageTemplate ? { pageTemplate } : {}),
              }
            : undefined,
      })
      index += 1
      continue
    }

    if (/^\[\[GP:RATING\b/i.test(line)) {
      flushParagraph()
      const previousBlock = blocks[blocks.length - 1]
      let prompt = 'Rating'
      let inheritedPageBreak: PublicationPageBreakIntent | undefined
      let inheritedPageTemplate: PublicationPageTemplate | undefined

      if (isPromptLikeBlock(previousBlock)) {
        const removed = blocks.pop()
        if (removed) {
          prompt = removed.text
          inheritedPageBreak = removed.layout?.pageBreakBefore
          inheritedPageTemplate = removed.layout?.pageTemplate
        }
      }

      const requestedMin = parseNumericAttribute(line, 'min') ?? 0
      const requestedMax = parseNumericAttribute(line, 'max') ?? 10
      const validRange = requestedMax > requestedMin && requestedMax - requestedMin <= 20
      const min = validRange ? requestedMin : 0
      const max = validRange ? requestedMax : 10

      if (!validRange) {
        diagnostics.push({
          level: 'suggestion',
          code: 'rating-range-normalized',
          line: lineNumber,
          message: 'An invalid rating range was normalized to 0–10.',
        })
      }

      const pageBreakBefore = pendingPageBreak ?? inheritedPageBreak
      const pageTemplate = pendingPageTemplate ?? inheritedPageTemplate
      pendingPageBreak = undefined
      pendingPageTemplate = undefined

      pushBlock({
        id: createBlockId(),
        type: 'rating-field',
        text: prompt,
        min,
        max,
        layout:
          pageBreakBefore || pageTemplate
            ? {
                ...(pageBreakBefore ? { pageBreakBefore } : {}),
                ...(pageTemplate ? { pageTemplate } : {}),
              }
            : undefined,
      })
      index += 1
      continue
    }

    const nextLine = lines[index + 1]?.trim() ?? ''
    if (isMarkdownTableRow(line) && isMarkdownTableSeparator(nextLine)) {
      flushParagraph()
      const columns = parseMarkdownTableRow(line)
      const rows: string[][] = []
      index += 2

      while (index < lines.length) {
        const rowLine = lines[index]?.trim() ?? ''
        if (!rowLine || !isMarkdownTableRow(rowLine)) break

        const row = parseMarkdownTableRow(rowLine)
        const normalizedRow = columns.map((_, columnIndex) => row[columnIndex] ?? '')
        rows.push(normalizedRow)
        index += 1
      }

      pushBlock({
        id: createBlockId(),
        type: 'table',
        text: '',
        columns,
        rows,
      })
      continue
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
      index += 1
      continue
    }

    const headingMatch = rawLine.match(/^\s*(#{1,3})\s+(.+?)\s*$/)
    if (headingMatch) {
      flushParagraph()
      const markdownLevel = headingMatch[1].length as PublicationHeadingLevel
      const text = headingMatch[2].trim()

      if (markdownLevel === 1 && !title) {
        title = text
        index += 1
        continue
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
      index += 1
      continue
    }

    const checkboxMatch = line.match(/^[-*]\s+\[\s?\]\s+(.+)$/)
    if (checkboxMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'checkbox-field',
        text: checkboxMatch[1].trim(),
      })
      index += 1
      continue
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'paragraph',
        text: `• ${bulletMatch[1].trim()}`,
      })
      index += 1
      continue
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/)
    if (numberedMatch) {
      flushParagraph()
      pushBlock({
        id: createBlockId(),
        type: 'paragraph',
        text: line,
      })
      index += 1
      continue
    }

    paragraphLines.push(line)
    index += 1
  }

  flushParagraph()

  if (authorNote) {
    diagnostics.push({
      level: 'suggestion',
      code: 'unterminated-author-note',
      message: 'An author-only note was not closed with [[GP:END]]. It was kept out of publication output.',
    })
  }

  if (activeSemanticGroup) {
    diagnostics.push({
      level: 'suggestion',
      code: 'unterminated-repeatable-page',
      message: `Repeatable page “${activeSemanticGroup.name}” was not closed with [[GP:END_REPEATABLE_PAGE]]. Its content was preserved as one semantic group.`,
    })
  }

  if (pendingPageBreak) {
    diagnostics.push({
      level: 'info',
      code: 'trailing-page-break',
      message: 'A trailing page-break directive had no following content and was ignored.',
    })
  }

  if (pendingPageTemplate) {
    diagnostics.push({
      level: 'info',
      code: 'trailing-page-template',
      message: 'A trailing page-template directive had no following content and was ignored.',
    })
  }

  inferSemanticGroups(blocks)

  return {
    title: title || 'Untitled publication',
    content: { blocks },
    diagnostics,
    detectedProtocol,
  }
}
