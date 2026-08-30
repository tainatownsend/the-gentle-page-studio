import { readDocxTextEntries } from './docxZip'

export type DocxImportDiagnosticLevel = 'info' | 'suggestion'

export type DocxImportDiagnostic = {
  level: DocxImportDiagnosticLevel
  code: string
  message: string
}

export type DocxImportStats = {
  paragraphs: number
  tables: number
  listItems: number
  checkboxItems: number
  responseAreas: number
  pageBreakHints: number
}

export type DocxManuscriptImportResult = {
  manuscript: string
  diagnostics: DocxImportDiagnostic[]
  stats: DocxImportStats
}

type ParagraphStyleMap = Map<string, string>
type NumberingFormatMap = Map<string, string>

type DocxParagraphItem = {
  kind: 'paragraph'
  text: string
  styleId?: string
  styleName?: string
  headingLevel?: number
  isTitle: boolean
  listFormat?: string
  pageBreakBefore?: 'preferred' | 'forced'
  underlineOnly: boolean
}

type DocxTableItem = {
  kind: 'table'
  markdown: string
}

type DocxBreakItem = {
  kind: 'break'
  pageBreakBefore: 'forced'
}

type DocxBodyItem = DocxParagraphItem | DocxTableItem | DocxBreakItem

const DOCX_ENTRY_NAMES = [
  'word/document.xml',
  'word/styles.xml',
  'word/numbering.xml',
] as const

function getAttributeByLocalName(element: Element, localName: string): string | undefined {
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.localName === localName) return attribute.value
  }

  return undefined
}

function directChild(element: Element, localName: string): Element | undefined {
  return Array.from(element.children).find((child) => child.localName === localName)
}

function directChildren(element: Element, localName: string): Element[] {
  return Array.from(element.children).filter((child) => child.localName === localName)
}

function descendants(element: Element, localName: string): Element[] {
  return Array.from(element.getElementsByTagName('*')).filter(
    (candidate) => candidate.localName === localName,
  )
}

function parseXml(xml: string, label: string): XMLDocument {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const parseError = Array.from(document.getElementsByTagName('*')).find(
    (element) => element.localName === 'parsererror',
  )

  if (parseError) {
    throw new Error(`The Word document contains invalid ${label} XML.`)
  }

  return document
}

function isOn(element: Element | undefined): boolean {
  if (!element) return false
  const value = getAttributeByLocalName(element, 'val')?.toLowerCase()
  return value !== '0' && value !== 'false' && value !== 'off'
}

function parseParagraphStyles(stylesXml: string | undefined): ParagraphStyleMap {
  const styles = new Map<string, string>()
  if (!stylesXml) return styles

  const document = parseXml(stylesXml, 'styles')

  for (const style of Array.from(document.getElementsByTagName('*')).filter(
    (element) => element.localName === 'style',
  )) {
    const styleId = getAttributeByLocalName(style, 'styleId')
    const name = directChild(style, 'name')
      ? getAttributeByLocalName(directChild(style, 'name') as Element, 'val')
      : undefined

    if (styleId && name) styles.set(styleId, name)
  }

  return styles
}

function parseNumberingFormats(numberingXml: string | undefined): NumberingFormatMap {
  const formats = new Map<string, string>()
  if (!numberingXml) return formats

  const document = parseXml(numberingXml, 'numbering')
  const abstractFormats = new Map<string, Map<string, string>>()

  for (const abstractNum of Array.from(document.getElementsByTagName('*')).filter(
    (element) => element.localName === 'abstractNum',
  )) {
    const abstractId = getAttributeByLocalName(abstractNum, 'abstractNumId')
    if (!abstractId) continue

    const levelFormats = new Map<string, string>()

    for (const level of directChildren(abstractNum, 'lvl')) {
      const levelId = getAttributeByLocalName(level, 'ilvl') ?? '0'
      const numFmt = directChild(level, 'numFmt')
      const format = numFmt ? getAttributeByLocalName(numFmt, 'val') : undefined
      if (format) levelFormats.set(levelId, format)
    }

    abstractFormats.set(abstractId, levelFormats)
  }

  for (const num of Array.from(document.getElementsByTagName('*')).filter(
    (element) => element.localName === 'num',
  )) {
    const numId = getAttributeByLocalName(num, 'numId')
    const abstractNumIdElement = directChild(num, 'abstractNumId')
    const abstractNumId = abstractNumIdElement
      ? getAttributeByLocalName(abstractNumIdElement, 'val')
      : undefined

    if (!numId || !abstractNumId) continue

    const levelFormats = abstractFormats.get(abstractNumId)
    if (!levelFormats) continue

    for (const [levelId, format] of levelFormats.entries()) {
      formats.set(`${numId}:${levelId}`, format)
    }
  }

  return formats
}

function readParagraphText(paragraph: Element): string {
  const parts: string[] = []

  function visit(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      for (const child of Array.from(node.childNodes)) visit(child)
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

    if (element.localName === 'br' || element.localName === 'cr') {
      const breakType = getAttributeByLocalName(element, 'type')
      if (breakType !== 'page') parts.push('\n')
      return
    }

    for (const child of Array.from(element.childNodes)) visit(child)
  }

  for (const child of Array.from(paragraph.childNodes)) visit(child)

  return parts.join('').replace(/\u00a0/g, ' ').trim()
}

function parseHeadingLevel(
  styleId: string | undefined,
  styleName: string | undefined,
  paragraphProperties: Element | undefined,
): number | undefined {
  const styleLabel = `${styleName ?? ''} ${styleId ?? ''}`.trim()
  const headingMatch = styleLabel.match(/heading\s*([1-9])/i)
  if (headingMatch) return Number(headingMatch[1])

  const outlineLevel = paragraphProperties ? directChild(paragraphProperties, 'outlineLvl') : undefined
  const outlineValue = outlineLevel ? getAttributeByLocalName(outlineLevel, 'val') : undefined

  if (outlineValue !== undefined && /^\d+$/.test(outlineValue)) {
    return Number(outlineValue) + 1
  }

  return undefined
}

function parseListFormat(
  paragraphProperties: Element | undefined,
  numberingFormats: NumberingFormatMap,
): string | undefined {
  const numPr = paragraphProperties ? directChild(paragraphProperties, 'numPr') : undefined
  if (!numPr) return undefined

  const numIdElement = directChild(numPr, 'numId')
  const levelElement = directChild(numPr, 'ilvl')
  const numId = numIdElement ? getAttributeByLocalName(numIdElement, 'val') : undefined
  const level = levelElement ? getAttributeByLocalName(levelElement, 'val') ?? '0' : '0'

  if (!numId) return undefined
  return numberingFormats.get(`${numId}:${level}`) ?? 'bullet'
}

function parseParagraph(
  paragraph: Element,
  styles: ParagraphStyleMap,
  numberingFormats: NumberingFormatMap,
): DocxParagraphItem | DocxBreakItem | undefined {
  const paragraphProperties = directChild(paragraph, 'pPr')
  const styleElement = paragraphProperties ? directChild(paragraphProperties, 'pStyle') : undefined
  const styleId = styleElement ? getAttributeByLocalName(styleElement, 'val') : undefined
  const styleName = styleId ? styles.get(styleId) : undefined
  const text = readParagraphText(paragraph)
  const manualPageBreak = descendants(paragraph, 'br').some(
    (br) => getAttributeByLocalName(br, 'type') === 'page',
  )
  const pageBreakBefore = paragraphProperties
    ? isOn(directChild(paragraphProperties, 'pageBreakBefore'))
    : false

  if (!text && manualPageBreak) {
    return {
      kind: 'break',
      pageBreakBefore: 'forced',
    }
  }

  if (!text) return undefined

  const titleStyle = `${styleName ?? ''} ${styleId ?? ''}`.trim()
  const isTitle = /(^|\s)title($|\s)/i.test(titleStyle) && !/subtitle/i.test(titleStyle)

  return {
    kind: 'paragraph',
    text,
    styleId,
    styleName,
    headingLevel: parseHeadingLevel(styleId, styleName, paragraphProperties),
    isTitle,
    listFormat: parseListFormat(paragraphProperties, numberingFormats),
    pageBreakBefore: manualPageBreak ? 'forced' : pageBreakBefore ? 'preferred' : undefined,
    underlineOnly: /^_{3,}$/.test(text.replace(/\s+/g, '')),
  }
}

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' / ').trim()
}

function parseTable(table: Element): DocxTableItem | undefined {
  const rows = directChildren(table, 'tr')
    .map((row) =>
      directChildren(row, 'tc').map((cell) => {
        const cellParagraphs = directChildren(cell, 'p')
          .map((paragraph) => readParagraphText(paragraph))
          .filter(Boolean)
        return escapeMarkdownTableCell(cellParagraphs.join(' / '))
      }),
    )
    .filter((row) => row.some(Boolean))

  if (rows.length === 0) return undefined

  const columnCount = Math.max(...rows.map((row) => row.length), 1)
  const normalizedRows = rows.map((row) => [
    ...row,
    ...Array.from({ length: Math.max(0, columnCount - row.length) }, () => ''),
  ])
  const header = normalizedRows[0] ?? Array.from({ length: columnCount }, () => '')
  const separator = Array.from({ length: columnCount }, () => '---')
  const bodyRows = normalizedRows.slice(1)
  const markdownRows = [header, separator, ...bodyRows]

  return {
    kind: 'table',
    markdown: markdownRows.map((row) => `| ${row.join(' | ')} |`).join('\n'),
  }
}

function paragraphMarkdownPrefix(item: DocxParagraphItem): string | undefined {
  if (item.isTitle) return '#'

  if (item.headingLevel !== undefined) {
    if (item.headingLevel <= 1) return '##'
    return '###'
  }

  if (item.listFormat) {
    return item.listFormat === 'bullet' ? '-' : '1.'
  }

  return undefined
}

function normalizeCheckboxText(text: string): string | undefined {
  const checkboxMatch = text.match(/^(?:☐|□|\[\s?\])\s*(.+)$/)
  return checkboxMatch?.[1]?.trim()
}

function responseSizeForUnderlineCount(count: number): 'short' | 'medium' | 'long' {
  if (count <= 1) return 'short'
  if (count === 2) return 'medium'
  return 'long'
}

function isLikelyAuthorNoteLabel(text: string): boolean {
  return /^(?:PRODUCT\s*\/\s*LAYOUT NOTE|LAYOUT NOTE|INTERNAL DRAFT NOTE|INTERNAL NOTE)\b/i.test(
    text.trim(),
  )
}

function bodyItemsToManuscript(
  items: readonly DocxBodyItem[],
  diagnostics: DocxImportDiagnostic[],
  stats: DocxImportStats,
): string {
  const lines: string[] = []
  let titleWritten = false

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    if (!item) continue

    if (item.kind === 'break') {
      lines.push('[[GP:PAGE_BREAK type="forced"]]', '')
      stats.pageBreakHints += 1
      continue
    }

    if (item.kind === 'table') {
      lines.push(item.markdown, '')
      stats.tables += 1
      diagnostics.push({
        level: 'info',
        code: 'table-preserved-as-markdown',
        message:
          'A Word table was preserved as structured Markdown so no cell content is lost before first-class table rendering.',
      })
      continue
    }

    if (item.underlineOnly) {
      let underlineCount = 1
      while (
        items[index + underlineCount]?.kind === 'paragraph' &&
        (items[index + underlineCount] as DocxParagraphItem).underlineOnly
      ) {
        underlineCount += 1
      }

      lines.push(`[[GP:RESPONSE size="${responseSizeForUnderlineCount(underlineCount)}"]]`, '')
      stats.responseAreas += 1
      index += underlineCount - 1
      continue
    }

    if (item.pageBreakBefore) {
      lines.push(`[[GP:PAGE_BREAK type="${item.pageBreakBefore}"]]`, '')
      stats.pageBreakHints += 1
    }

    const checkboxText = normalizeCheckboxText(item.text)
    if (checkboxText) {
      lines.push(`- [ ] ${checkboxText}`, '')
      stats.checkboxItems += 1
      continue
    }

    if (isLikelyAuthorNoteLabel(item.text)) {
      lines.push('[[GP:AUTHOR_NOTE]]', item.text, '[[GP:END]]', '')
      diagnostics.push({
        level: 'suggestion',
        code: 'author-note-label-detected',
        message:
          'A likely internal author/layout note label was kept out of publication output. Review it only if it was intended for readers.',
      })
      continue
    }

    const prefix = paragraphMarkdownPrefix(item)

    if (prefix === '#') {
      if (titleWritten) {
        lines.push(`## ${item.text}`, '')
      } else {
        lines.push(`# ${item.text}`, '')
        titleWritten = true
      }
      continue
    }

    if (prefix === '##' || prefix === '###') {
      lines.push(`${prefix} ${item.text}`, '')
      continue
    }

    if (prefix === '-' || prefix === '1.') {
      lines.push(`${prefix} ${item.text}`)
      stats.listItems += 1
      const next = items[index + 1]
      if (!next || next.kind !== 'paragraph' || !next.listFormat) lines.push('')
      continue
    }

    lines.push(item.text, '')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function convertDocxXmlToGentlePageManuscript(
  documentXml: string,
  stylesXml?: string,
  numberingXml?: string,
): DocxManuscriptImportResult {
  const document = parseXml(documentXml, 'document')
  const body = Array.from(document.getElementsByTagName('*')).find(
    (element) => element.localName === 'body',
  )

  if (!body) throw new Error('The Word document does not contain a readable document body.')

  const styles = parseParagraphStyles(stylesXml)
  const numberingFormats = parseNumberingFormats(numberingXml)
  const items: DocxBodyItem[] = []
  const diagnostics: DocxImportDiagnostic[] = []
  const stats: DocxImportStats = {
    paragraphs: 0,
    tables: 0,
    listItems: 0,
    checkboxItems: 0,
    responseAreas: 0,
    pageBreakHints: 0,
  }

  for (const child of Array.from(body.children)) {
    if (child.localName === 'p') {
      const paragraph = parseParagraph(child, styles, numberingFormats)
      if (paragraph) {
        items.push(paragraph)
        if (paragraph.kind === 'paragraph') stats.paragraphs += 1
      }
      continue
    }

    if (child.localName === 'tbl') {
      const table = parseTable(child)
      if (table) items.push(table)
    }
  }

  const manuscript = bodyItemsToManuscript(items, diagnostics, stats)

  if (!manuscript) {
    throw new Error('The Word document does not contain importable publication content.')
  }

  return {
    manuscript,
    diagnostics,
    stats,
  }
}

function fileNameTitle(fileName: string): string {
  const withoutExtension = fileName.replace(/\.docx$/i, '')
  return withoutExtension.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled publication'
}

function hasPublicationTitle(manuscript: string): boolean {
  return /^#\s+.+$/m.test(manuscript)
}

export async function importDocxManuscript(file: File): Promise<DocxManuscriptImportResult> {
  if (!/\.docx$/i.test(file.name)) {
    throw new Error('Choose a Microsoft Word .docx file.')
  }

  const entries = await readDocxTextEntries(await file.arrayBuffer(), DOCX_ENTRY_NAMES)
  const documentXml = entries.get('word/document.xml')

  if (!documentXml) {
    throw new Error('This .docx file does not contain a readable Word document body.')
  }

  const result = convertDocxXmlToGentlePageManuscript(
    documentXml,
    entries.get('word/styles.xml'),
    entries.get('word/numbering.xml'),
  )

  if (hasPublicationTitle(result.manuscript)) return result

  return {
    ...result,
    manuscript: `# ${fileNameTitle(file.name)}\n\n${result.manuscript}`,
    diagnostics: [
      ...result.diagnostics,
      {
        level: 'info',
        code: 'filename-title-fallback',
        message: 'No Word Title style was found, so the filename was used as the publication title.',
      },
    ],
  }
}
