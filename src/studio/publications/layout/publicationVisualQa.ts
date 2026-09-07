import type { PublicationBlock } from '../types'
import { inferPublicationCompoundComponents } from './publicationCompoundComponents'
import { inferPublicationPageArchetype } from './publicationPageArchetypes'

export type PublicationVisualQaIssueCode =
  | 'heading-only-page'
  | 'severe-underutilization'
  | 'protocol-syntax-leak'
  | 'fragmented-compound-component'

export type PublicationVisualQaIssue = {
  code: PublicationVisualQaIssueCode
  message: string
  pageNumber?: number
  blockId?: string
  severity: 'warning' | 'error'
}

export type PublicationVisualQaPage = {
  pageNumber?: number
  kind: 'cover' | 'content'
  blocks: PublicationBlock[]
  remainingUnits: number
}

export type PublicationVisualQaResult = {
  score: number
  issues: PublicationVisualQaIssue[]
}

const PROTOCOL_PATTERN = /\[\[GP:|(?:^|\s)-\s*\[\s?\]/i
const SEVERE_UNDERUTILIZATION_REMAINING_UNITS = 28

function blockContainsProtocolSyntax(block: PublicationBlock): boolean {
  if (PROTOCOL_PATTERN.test(block.text)) return true

  if (block.type === 'table') {
    if (block.columns.some((cell) => PROTOCOL_PATTERN.test(cell))) return true
    return block.rows.some((row) => row.some((cell) => PROTOCOL_PATTERN.test(cell)))
  }

  return false
}

function pageStartsRepeatableGroup(page: PublicationVisualQaPage | undefined): boolean {
  return page?.blocks[0]?.semanticGroup?.kind === 'repeatable-page'
}

function isRepeatablePage(page: PublicationVisualQaPage): boolean {
  if (page.blocks.length === 0) return false

  const group = page.blocks[0]?.semanticGroup
  if (group?.kind !== 'repeatable-page') return false

  return page.blocks.every((block) => block.semanticGroup?.id === group.id)
}

export function auditPublicationVisualQuality(
  pages: readonly PublicationVisualQaPage[],
): PublicationVisualQaResult {
  const issues: PublicationVisualQaIssue[] = []
  const contentPages = pages.filter((page) => page.kind === 'content')
  const pageByBlockId = new Map<string, number | undefined>()

  contentPages.forEach((page, pageIndex) => {
    page.blocks.forEach((block) => pageByBlockId.set(block.id, page.pageNumber))

    const archetype = inferPublicationPageArchetype(page.blocks)
    const first = page.blocks[0]
    const isIntentionalSectionOpener = archetype === 'section-opener'
    const hasAuthoredBreak = first?.layout?.pageBreakBefore !== undefined
    const nextPageStartsRepeatable = pageStartsRepeatableGroup(contentPages[pageIndex + 1])
    const currentPageIsRepeatable = isRepeatablePage(page)

    if (
      page.blocks.length === 1 &&
      first?.type === 'heading' &&
      first.level !== 1 &&
      !hasAuthoredBreak &&
      !currentPageIsRepeatable
    ) {
      issues.push({
        code: 'heading-only-page',
        severity: 'warning',
        pageNumber: page.pageNumber,
        blockId: first.id,
        message: 'A heading is stranded on a page without the content it introduces.',
      })
    }

    const isFinalPage = pageIndex === contentPages.length - 1
    if (
      !isFinalPage &&
      !isIntentionalSectionOpener &&
      !hasAuthoredBreak &&
      !currentPageIsRepeatable &&
      !nextPageStartsRepeatable &&
      page.blocks.length > 0 &&
      page.remainingUnits >= SEVERE_UNDERUTILIZATION_REMAINING_UNITS
    ) {
      issues.push({
        code: 'severe-underutilization',
        severity: 'warning',
        pageNumber: page.pageNumber,
        blockId: first?.id,
        message: 'This page is severely under-utilized without an editorial reason.',
      })
    }

    for (const block of page.blocks) {
      if (!blockContainsProtocolSyntax(block)) continue

      issues.push({
        code: 'protocol-syntax-leak',
        severity: 'error',
        pageNumber: page.pageNumber,
        blockId: block.id,
        message: 'Gentle Page compiler syntax is visible in reader-facing publication content.',
      })
    }
  })

  const flattenedBlocks = contentPages.flatMap((page) => page.blocks)
  for (const component of inferPublicationCompoundComponents(flattenedBlocks)) {
    const componentPages = new Set(
      component.blockIds
        .map((blockId) => pageByBlockId.get(blockId))
        .filter((pageNumber): pageNumber is number => pageNumber !== undefined),
    )

    if (componentPages.size <= 1) continue

    const pageNumber = Math.min(...componentPages)
    issues.push({
      code: 'fragmented-compound-component',
      severity: 'warning',
      pageNumber,
      blockId: component.blockIds[0],
      message: `The journal tool “${component.name}” is fragmented across pages.`,
    })
  }

  const penalty = issues.reduce((total, issue) => {
    switch (issue.code) {
      case 'protocol-syntax-leak':
        return total + 40
      case 'heading-only-page':
        return total + 24
      case 'fragmented-compound-component':
        return total + 20
      case 'severe-underutilization':
        return total + 12
    }
  }, 0)

  return {
    score: Math.max(0, 100 - penalty),
    issues,
  }
}
