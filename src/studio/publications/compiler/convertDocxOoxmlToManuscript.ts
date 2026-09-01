export type DocxOoxmlDiagnostic = {
  code: string
  message: string
}

export type DocxOoxmlConversionResult = {
  manuscript: string
  diagnostics: DocxOoxmlDiagnostic[]
}

type DocxSemanticItem = {
  kind: 'content' | 'writing-lines'
  text: string
  writingLineCount?: number
  pageBreakBefore?: 'preferred' | 'forced'
}

function getAttribute(element: Element, localName: string): string | undefined {
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.localName === localName) {
      return attribute.value
    }
  }

  return undefined
}

function childElementsByLocalName(element: Element, localName: string): Element[] {
  return Array.from(element.children).filter((child) => child.localName === localName)
}

function descendantsByLocalName(element: Element, localName: string): Element[] {
  return Array.from(element.getElementsByTagNameNS('*', localName))
}

function firstDescendantByLocalName(element: Element, localName: string): Element | undefined {
  return descendantsByLocalName(element, localName)[0]
}

function parseXml(xml: string, label: string): Document {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = document.getElementsByTagName('parsererror')[0]

  if (parserError) {
    throw new Error(`Could not read ${label} XML.`)
  }

  return document
}

function buildStyleNames(stylesXml?: string): Map<string, string> {
  const styles = new Map<string, string>()

  if (!stylesXml?.trim()) {
    return styles
  }

  const document = parseXml(stylesXml, 'Word styles')

  descendantsByLocalName(document.documentElement, 'style').forEach((style) => {
    const styleId = getAttribute(style, 'styleId')
    const nameElement = firstDescendantByLocalName(style, 'name')
    const name = nameElement ? getAttribute(nameElement, 'val') : undefined

    if (styleId && name) {
      styles.set(styleId, name)
    }
  })

  return styles
}

function normalizeStyleName(value: string | undefined): string {
  return (value ?? '').toLowerCase().replace(/[\s_-]+/g, '')
}

function getParagraphStyle(paragraph: Element, styleNames: Map<string, string>): string {
  const styleElement = firstDescendantByLocalName(paragraph, 'pStyle')
  const styleId = styleElement ? getAttribute(styleElement, 'val') : undefined

  return styleNames.get(styleId ?? '') ?? styleId ?? ''
}

function paragraphText(paragraph: Element): string {
  const parts: string[] = []

  const visit = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const element = node as Element

    if (element.localName === 't') {
      parts.push(element.textContent ?? '')
      return
    }

    if (element.localName === 'tab') {
      parts.push('\t')
      return
    }

    if (element.localName === 'br' && getAttribute(element, 'type') !== 'page') {
      parts.push('\n')
      return
    }

    Array.from(element.childNodes).forEach(visit)
  }

  visit(paragraph)

  return parts.join('').replace(/[ \t]+\n/g, '\n').trim()
}

function paragraphHasPageBreakBefore(paragraph: Element): boolean {
  return descendantsByLocalName(paragraph, 'pageBreakBefore').length > 0
}

function paragraphHasManualPageBreak(paragraph: Element): boolean {
  return descendantsByLocalName(paragraph, 'br').some(
    (element) => getAttribute(element, 'type') === 'page',
  )
}

function markdownHeadingPrefix(style: string): string | undefined {
  const normalized = normalizeStyleName(style)

  if (normalized === 'title') return '#'
  if (normalized === 'heading1' || normalized === 'heading01') return '##'
  if (
    normalized === 'heading2' ||
    normalized === 'heading02' ||
    normalized === 'heading3' ||
    normalized === 'heading03'
  ) {
    return '###'
  }

  return undefined
}

function normalizeCheckbox(text: string): string | undefined {
  const match = text.match(/^(?:\[\s?\]|☐|□)\s*(.+)$/u)
  return match?.[1]?.trim() ? `- [ ] ${match[1].trim()}` : undefined
}

function isWritingLine(text: string): boolean {
  const compact = text.replace(/\s+/g, '')
  return /^_{5,}$/.test(compact)
}

function authorNote(text: string): string | undefined {
  if (!/^(PRODUCT\s*\/\s*LAYOUT NOTE|INTERNAL DRAFT NOTE)\b/i.test(text)) {
    return undefined
  }

  return `[[GP:AUTHOR_NOTE]]\n${text}\n[[GP:END]]`
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim()
}

function tableToMarkdown(table: Element): string | undefined {
  const rows = childElementsByLocalName(table, 'tr').map((row) =>
    childElementsByLocalName(row, 'tc').map((cell) => {
      const paragraphs = childElementsByLocalName(cell, 'p')
      const text = paragraphs.map(paragraphText).filter(Boolean).join('\n')
      return escapeMarkdownCell(text)
    }),
  )

  if (rows.length === 0) {
    return undefined
  }

  const columnCount = Math.max(...rows.map((row) => row.length), 1)
  const normalizedRows = rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? ''),
  )
  const header = normalizedRows[0] ?? Array.from({ length: columnCount }, () => '')
  const bodyRows = normalizedRows.slice(1)
  const separator = Array.from({ length: columnCount }, () => '---')
  const renderRow = (row: string[]) => `| ${row.join(' | ')} |`

  return [renderRow(header), renderRow(separator), ...bodyRows.map(renderRow)].join('\n')
}

function paragraphToItem(
  paragraph: Element,
  styleNames: Map<string, string>,
): DocxSemanticItem | undefined {
  const text = paragraphText(paragraph)
  const preferredBreak = paragraphHasPageBreakBefore(paragraph)
  const forcedBreak = paragraphHasManualPageBreak(paragraph)
  const pageBreakBefore = forcedBreak ? 'forced' : preferredBreak ? 'preferred' : undefined

  if (!text) {
    if (pageBreakBefore) {
      return {
        kind: 'content',
        text: '',
        pageBreakBefore,
      }
    }

    return undefined
  }

  if (isWritingLine(text)) {
    return {
      kind: 'writing-lines',
      text,
      writingLineCount: 1,
      pageBreakBefore,
    }
  }

  const checkbox = normalizeCheckbox(text)
  const note = authorNote(text)
  const headingPrefix = markdownHeadingPrefix(getParagraphStyle(paragraph, styleNames))
  const content = note ?? checkbox ?? (headingPrefix ? `${headingPrefix} ${text}` : text)

  return {
    kind: 'content',
    text: content,
    pageBreakBefore,
  }
}

function writingDirective(lineCount: number): string {
  if (lineCount <= 1) return '[[GP:RESPONSE size="short"]]'
  if (lineCount === 2) return '[[GP:RESPONSE size="medium"]]'
  return '[[GP:RESPONSE size="long"]]'
}

function renderSemanticItems(items: DocxSemanticItem[]): string {
  const output: string[] = []
  let index = 0

  while (index < items.length) {
    const item = items[index]

    if (!item) {
      index += 1
      continue
    }

    if (item.pageBreakBefore) {
      output.push(`[[GP:PAGE_BREAK type="${item.pageBreakBefore}"]]`)
    }

    if (item.kind === 'writing-lines') {
      let count = item.writingLineCount ?? 1
      let nextIndex = index + 1

      while (nextIndex < items.length) {
        const next = items[nextIndex]
        if (!next || next.kind !== 'writing-lines' || next.pageBreakBefore) break
        count += next.writingLineCount ?? 1
        nextIndex += 1
      }

      output.push(writingDirective(count))
      index = nextIndex
      continue
    }

    if (item.text) {
      output.push(item.text)
    }

    index += 1
  }

  return output.join('\n\n').trim()
}

export function convertDocxOoxmlToManuscript(
  documentXml: string,
  stylesXml?: string,
): DocxOoxmlConversionResult {
  const diagnostics: DocxOoxmlDiagnostic[] = []
  const document = parseXml(documentXml, 'Word document')
  const styleNames = buildStyleNames(stylesXml)
  const body = descendantsByLocalName(document.documentElement, 'body')[0]

  if (!body) {
    return {
      manuscript: '',
      diagnostics: [
        {
          code: 'missing-document-body',
          message: 'The Word document does not contain a readable document body.',
        },
      ],
    }
  }

  const items: DocxSemanticItem[] = []

  Array.from(body.children).forEach((element) => {
    if (element.localName === 'p') {
      const item = paragraphToItem(element, styleNames)
      if (item) items.push(item)
      return
    }

    if (element.localName === 'tbl') {
      const table = tableToMarkdown(element)
      if (table) {
        items.push({ kind: 'content', text: table })
      }
    }
  })

  return {
    manuscript: renderSemanticItems(items),
    diagnostics,
  }
}
