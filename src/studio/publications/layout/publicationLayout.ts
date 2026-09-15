import type {
  Publication,
  PublicationBlock,
  PublicationDocumentSettings,
  PublicationTableBlock,
} from '../types'
import { getPublicationCompoundComponentAtIndex } from './publicationCompoundComponents'
import { recomposePublicationPages } from './publicationRecomposition'
import { healPublicationPages } from './publicationSelfHealing'
import {
  auditPublicationVisualQuality,
  type PublicationVisualQaIssueCode,
} from './publicationVisualQa'

export type PublicationLayoutPageKind = 'cover' | 'content'

export type PublicationLayoutBlockAllocation = {
  blockId: string
  baselineUnits: number
  allocatedUnits: number
  flexibleUnits: number
}

export type PublicationLayoutPage = {
  id: string
  sequence: number
  kind: PublicationLayoutPageKind
  pageNumber?: number
  blocks: PublicationBlock[]
  allocations: PublicationLayoutBlockAllocation[]
  usedUnits: number
  remainingUnits: number
}

export type PublicationLayoutDiagnosticCode =
  | 'oversized-block'
  | 'sparse-page'
  | PublicationVisualQaIssueCode

export type PublicationLayoutDiagnostic = {
  code: PublicationLayoutDiagnosticCode
  message: string
  pageNumber?: number
  blockId?: string
  semanticGroupId?: string
}

export type PublicationLayout = {
  settings: PublicationDocumentSettings
  pages: PublicationLayoutPage[]
  health: 'healthy' | 'needs-attention'
  qualityScore: number
  diagnostics: PublicationLayoutDiagnostic[]
}

export const PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS = 48
const PREFERRED_PAGE_BREAK_MINIMUM_FILL_UNITS = 20
const SPARSE_PAGE_REMAINING_UNITS = 18
const RECOMPOSITION_MINIMUM_BALANCED_PAGE_UNITS = 18

function cloneDocumentSettings(
  settings: PublicationDocumentSettings,
): PublicationDocumentSettings {
  return {
    ...settings,
    margins: {
      ...settings.margins,
    },
  }
}

function cloneBlock(block: PublicationBlock): PublicationBlock {
  const shared = {
    layout: block.layout ? { ...block.layout } : undefined,
    semanticGroup: block.semanticGroup ? { ...block.semanticGroup } : undefined,
  }

  if (block.type === 'table') {
    return {
      ...block,
      ...shared,
      columns: [...block.columns],
      rows: block.rows.map((row) => [...row]),
      cellControls: block.cellControls?.map((row) =>
        row.map((controls) => controls.map((control) => ({ ...control }))),
      ),
    }
  }

  return {
    ...block,
    ...shared,
  }
}

function estimateTableUnits(block: PublicationTableBlock): number {
  const columnCount = Math.max(block.columns.length, 1)
  const charactersPerVisualLine = Math.max(40 * columnCount, 1)
  const headerCharacters = block.columns.reduce((total, cell) => total + cell.length, 0)
  const headerVisualLines = Math.max(1, Math.ceil(headerCharacters / charactersPerVisualLine))
  const chromeUnits = block.text ? 3 : 2
  const headerUnits = 2 + Math.max(0, headerVisualLines - 1)
  const rowUnits = block.rows.reduce((total, row) => {
    const rowCharacters = row.reduce((sum, cell) => sum + cell.length, 0)
    const visualLines = Math.max(1, Math.ceil(rowCharacters / charactersPerVisualLine))
    return total + 2 + Math.max(0, visualLines - 1)
  }, 0)

  return chromeUnits + headerUnits + rowUnits
}

export function estimatePublicationBlockUnits(block: PublicationBlock): number {
  const textLength = Math.max(block.text.trim().length, 1)

  switch (block.type) {
    case 'heading': {
      const baseUnits = block.level === 1 ? 5 : 3
      const visualLines = Math.max(1, Math.ceil(textLength / 45))
      return baseUnits + Math.max(0, visualLines - 1) * 2
    }
    case 'paragraph': {
      const visualLines = Math.max(1, Math.ceil(textLength / 75))
      return 3 + Math.max(0, visualLines - 1) * 2
    }
    case 'multiline-text-field': {
      const baseUnits =
        block.responseSize === 'short' ? 8 : block.responseSize === 'medium' ? 10 : 12
      const promptLines = Math.max(1, Math.ceil(textLength / 75))
      return baseUnits + Math.max(0, promptLines - 1) * 2
    }
    case 'checkbox-field': {
      const visualLines = Math.max(1, Math.ceil(textLength / 75))
      return 3 + Math.max(0, visualLines - 1) * 2
    }
    case 'rating-field': {
      const optionCount = Math.max(1, Math.floor(block.max - block.min) + 1)
      const promptLines = Math.max(1, Math.ceil(textLength / 75))
      const optionRows = Math.max(1, Math.ceil(optionCount / 14))
      return 7 + Math.max(0, promptLines - 1) * 2 + Math.max(0, optionRows - 1) * 3
    }
    case 'table':
      return estimateTableUnits(block)
  }
}

function getFlexibleResponseUnits(block: PublicationBlock): number {
  if (block.type !== 'multiline-text-field') {
    return 0
  }

  switch (block.responseSize) {
    case 'short':
      return 4
    case 'medium':
      return 10
    case 'long':
      return 14
    default:
      return 10
  }
}

function shouldKeepWithNext(block: PublicationBlock): boolean {
  return block.layout?.keepWithNext ?? block.type === 'heading'
}

function getCheckboxGroupUnits(
  blocks: readonly PublicationBlock[],
  startIndex: number,
): number | undefined {
  if (blocks[startIndex]?.type !== 'checkbox-field') {
    return undefined
  }

  let total = 0
  let index = startIndex

  while (index < blocks.length && blocks[index]?.type === 'checkbox-field') {
    total += estimatePublicationBlockUnits(blocks[index] as PublicationBlock)
    index += 1
  }

  return total
}

function getCompoundComponentUnits(
  blocks: readonly PublicationBlock[],
  startIndex: number,
): number | undefined {
  const component = getPublicationCompoundComponentAtIndex(blocks, startIndex)
  if (!component) return undefined

  return blocks
    .slice(component.startIndex, component.endIndex)
    .reduce((total, componentBlock) => total + estimatePublicationBlockUnits(componentBlock), 0)
}

function crossesRepeatablePageBoundary(
  blocks: readonly PublicationBlock[],
  index: number,
): boolean {
  if (index === 0) return false

  const previousGroup = blocks[index - 1]?.semanticGroup
  const currentGroup = blocks[index]?.semanticGroup
  const previousRepeatableId =
    previousGroup?.kind === 'repeatable-page' ? previousGroup.id : undefined
  const currentRepeatableId = currentGroup?.kind === 'repeatable-page' ? currentGroup.id : undefined

  return (
    previousRepeatableId !== currentRepeatableId &&
    (previousRepeatableId !== undefined || currentRepeatableId !== undefined)
  )
}

function paginateBlocks(blocks: readonly PublicationBlock[]): PublicationBlock[][] {
  if (blocks.length === 0) {
    return [[]]
  }

  const pages: PublicationBlock[][] = []
  let currentPage: PublicationBlock[] = []
  let currentUnits = 0

  blocks.forEach((block, index) => {
    const blockUnits = estimatePublicationBlockUnits(block)
    const nextBlock = blocks[index + 1]
    const nextBlockUnits = nextBlock ? estimatePublicationBlockUnits(nextBlock) : 0
    const pairFitsOnFreshPage =
      nextBlock !== undefined &&
      blockUnits + nextBlockUnits <= PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS
    const wouldOrphanKeepWithNextBlock =
      currentPage.length > 0 &&
      shouldKeepWithNext(block) &&
      pairFitsOnFreshPage &&
      currentUnits + blockUnits + nextBlockUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    const compoundComponentUnits = getCompoundComponentUnits(blocks, index)
    const currentPageIsMeaningfullyFilled =
      currentUnits >= PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS - SPARSE_PAGE_REMAINING_UNITS
    const wouldStartLongCompoundComponent =
      currentPage.length > 0 &&
      block.type === 'heading' &&
      compoundComponentUnits !== undefined &&
      compoundComponentUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS &&
      currentUnits >= PREFERRED_PAGE_BREAK_MINIMUM_FILL_UNITS
    const wouldSplitCompoundComponent =
      currentPage.length > 0 &&
      currentPageIsMeaningfullyFilled &&
      compoundComponentUnits !== undefined &&
      compoundComponentUnits <= PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS &&
      currentUnits + compoundComponentUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    const checkboxGroupUnits = getCheckboxGroupUnits(blocks, index)
    const startsCheckboxGroup =
      block.type === 'checkbox-field' && blocks[index - 1]?.type !== 'checkbox-field'
    const headingAlreadyIntroducesCheckboxGroup =
      currentPage[currentPage.length - 1]?.type === 'heading'
    const wouldSplitCheckboxGroup =
      currentPage.length > 0 &&
      startsCheckboxGroup &&
      !headingAlreadyIntroducesCheckboxGroup &&
      checkboxGroupUnits !== undefined &&
      checkboxGroupUnits <= PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS &&
      currentUnits + checkboxGroupUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    const semanticBoundaryBreak =
      currentPage.length > 0 && crossesRepeatablePageBoundary(blocks, index)
    const forcedBreak = currentPage.length > 0 && block.layout?.pageBreakBefore === 'forced'
    const preferredBreak =
      currentPage.length > 0 &&
      block.layout?.pageBreakBefore === 'preferred' &&
      currentUnits >= PREFERRED_PAGE_BREAK_MINIMUM_FILL_UNITS
    const capacityBreak =
      currentPage.length > 0 &&
      currentUnits + blockUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    if (
      semanticBoundaryBreak ||
      forcedBreak ||
      preferredBreak ||
      wouldStartLongCompoundComponent ||
      wouldSplitCompoundComponent ||
      wouldOrphanKeepWithNextBlock ||
      wouldSplitCheckboxGroup ||
      capacityBreak
    ) {
      pages.push(currentPage)
      currentPage = []
      currentUnits = 0
    }

    currentPage.push(cloneBlock(block))
    currentUnits += blockUnits
  })

  pages.push(currentPage)

  return pages
}

function allocatePage(blocks: readonly PublicationBlock[]) {
  const allocations: PublicationLayoutBlockAllocation[] = blocks.map((block) => {
    const baselineUnits = estimatePublicationBlockUnits(block)

    return {
      blockId: block.id,
      baselineUnits,
      allocatedUnits: baselineUnits,
      flexibleUnits: getFlexibleResponseUnits(block),
    }
  })

  const baselineUsedUnits = allocations.reduce(
    (total, allocation) => total + allocation.baselineUnits,
    0,
  )
  let availableUnits = Math.max(0, PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS - baselineUsedUnits)

  while (availableUnits > 0) {
    let allocatedAnyUnit = false

    for (const allocation of allocations) {
      if (availableUnits === 0) {
        break
      }

      const maximumUnits = allocation.baselineUnits + allocation.flexibleUnits

      if (allocation.allocatedUnits >= maximumUnits) {
        continue
      }

      allocation.allocatedUnits += 1
      availableUnits -= 1
      allocatedAnyUnit = true
    }

    if (!allocatedAnyUnit) {
      break
    }
  }

  const usedUnits = allocations.reduce((total, allocation) => total + allocation.allocatedUnits, 0)

  return {
    allocations,
    usedUnits,
    remainingUnits: Math.max(0, PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS - usedUnits),
  }
}

function isRepeatablePage(page: PublicationLayoutPage): boolean {
  if (page.blocks.length === 0) return false

  const semanticGroup = page.blocks[0]?.semanticGroup
  if (semanticGroup?.kind !== 'repeatable-page') return false

  return page.blocks.every((block) => block.semanticGroup?.id === semanticGroup.id)
}

function pageStartsRepeatableGroup(page: PublicationLayoutPage | undefined): boolean {
  return page?.blocks[0]?.semanticGroup?.kind === 'repeatable-page'
}

function createDiagnostics(pages: readonly PublicationLayoutPage[]): PublicationLayoutDiagnostic[] {
  const diagnostics: PublicationLayoutDiagnostic[] = []
  const contentPages = pages.filter((page) => page.kind === 'content')
  contentPages.forEach((page, pageIndex) => {
    page.allocations.forEach((allocation) => {
      if (allocation.baselineUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS) {
        diagnostics.push({
          code: 'oversized-block',
          pageNumber: page.pageNumber,
          blockId: allocation.blockId,
          message: 'A content block is taller than one page and may require manual review.',
        })
      }
    })

    const isFinalPage = pageIndex === contentPages.length - 1
    const startsWithForcedBreak = page.blocks[0]?.layout?.pageBreakBefore === 'forced'
    const nextPageStartsRepeatable = pageStartsRepeatableGroup(contentPages[pageIndex + 1])

    if (
      !isFinalPage &&
      !startsWithForcedBreak &&
      !nextPageStartsRepeatable &&
      !isRepeatablePage(page) &&
      page.blocks.length > 0 &&
      page.remainingUnits >= SPARSE_PAGE_REMAINING_UNITS
    ) {
      diagnostics.push({
        code: 'sparse-page',
        pageNumber: page.pageNumber,
        message: 'This page remains unusually sparse after automatic response-field expansion.',
      })
    }
  })

  return diagnostics
}

export function createPublicationLayout(publication: Publication): PublicationLayout {
  const initiallyPaginated = paginateBlocks(publication.content.blocks)
  const recomposedPages = recomposePublicationPages(initiallyPaginated, {
    capacityUnits: PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS,
    minimumBalancedPageUnits: RECOMPOSITION_MINIMUM_BALANCED_PAGE_UNITS,
    estimateUnits: estimatePublicationBlockUnits,
  })
  const contentPages = healPublicationPages(recomposedPages, {
    capacityUnits: PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS,
    estimateUnits: estimatePublicationBlockUnits,
  })
  const pages: PublicationLayoutPage[] = [
    {
      id: `${publication.id}-cover`,
      sequence: 1,
      kind: 'cover',
      blocks: [],
      allocations: [],
      usedUnits: 0,
      remainingUnits: 0,
    },
    ...contentPages.map((blocks, index) => {
      const allocation = allocatePage(blocks)

      return {
        id: `${publication.id}-content-page-${index + 1}`,
        sequence: index + 2,
        kind: 'content' as const,
        pageNumber: index + 1,
        blocks,
        ...allocation,
      }
    }),
  ]

  const visualQa = auditPublicationVisualQuality(pages, {
    capacityUnits: PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS,
    estimateUnits: estimatePublicationBlockUnits,
    minimumCompoundMoveFillUnits:
      PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS - SPARSE_PAGE_REMAINING_UNITS,
  })
  const severeVisualPages = new Set(
    visualQa.issues
      .filter((issue) => issue.code === 'severe-underutilization')
      .map((issue) => issue.pageNumber),
  )
  const structuralDiagnostics = createDiagnostics(pages).filter(
    (diagnostic) =>
      diagnostic.code !== 'sparse-page' || !severeVisualPages.has(diagnostic.pageNumber),
  )
  const diagnostics: PublicationLayoutDiagnostic[] = [
    ...structuralDiagnostics,
    ...visualQa.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      pageNumber: issue.pageNumber,
      blockId: issue.blockId,
    })),
  ]

  return {
    settings: cloneDocumentSettings(publication.documentSettings),
    pages,
    health: diagnostics.length === 0 ? 'healthy' : 'needs-attention',
    qualityScore: visualQa.score,
    diagnostics,
  }
}
