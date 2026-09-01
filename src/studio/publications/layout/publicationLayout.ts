import type {
  Publication,
  PublicationBlock,
  PublicationDocumentSettings,
  PublicationTableBlock,
} from '../types'

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

export type PublicationLayoutDiagnostic = {
  code: 'oversized-block' | 'sparse-page' | 'repeatable-group-overflow'
  message: string
  pageNumber?: number
  blockId?: string
  semanticGroupId?: string
}

export type PublicationLayout = {
  settings: PublicationDocumentSettings
  pages: PublicationLayoutPage[]
  health: 'healthy' | 'needs-attention'
  diagnostics: PublicationLayoutDiagnostic[]
}

export const PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS = 48
const PREFERRED_PAGE_BREAK_MINIMUM_FILL_UNITS = 20
const SPARSE_PAGE_REMAINING_UNITS = 18

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
    }
  }

  return {
    ...block,
    ...shared,
  }
}

function estimateTableUnits(block: PublicationTableBlock): number {
  const columnCount = Math.max(block.columns.length, 1)
  const headerCharacters = block.columns.reduce((total, cell) => total + cell.length, 0)
  const headerUnits = 5 + Math.ceil(headerCharacters / Math.max(36 * columnCount, 1)) * 2
  const rowUnits = block.rows.reduce((total, row) => {
    const rowCharacters = row.reduce((sum, cell) => sum + cell.length, 0)
    return total + 4 + Math.ceil(rowCharacters / Math.max(42 * columnCount, 1)) * 2
  }, 0)

  return headerUnits + rowUnits
}

export function estimatePublicationBlockUnits(block: PublicationBlock): number {
  const textLength = Math.max(block.text.trim().length, 1)

  switch (block.type) {
    case 'heading':
      return 5 + Math.ceil(textLength / 45) * 2
    case 'paragraph':
      return 3 + Math.ceil(textLength / 70) * 3
    case 'multiline-text-field': {
      const baseUnits =
        block.responseSize === 'short' ? 7 : block.responseSize === 'medium' ? 10 : 14
      return baseUnits + Math.ceil(textLength / 70) * 2
    }
    case 'checkbox-field':
      return 5 + Math.ceil(textLength / 70) * 2
    case 'rating-field': {
      const optionCount = Math.max(1, Math.floor(block.max - block.min) + 1)
      return 7 + Math.ceil(textLength / 70) * 2 + Math.ceil(optionCount / 6) * 3
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
      return 8
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

    const checkboxGroupUnits = getCheckboxGroupUnits(blocks, index)
    const startsCheckboxGroup =
      block.type === 'checkbox-field' && blocks[index - 1]?.type !== 'checkbox-field'
    const wouldSplitCheckboxGroup =
      currentPage.length > 0 &&
      startsCheckboxGroup &&
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
  const repeatableGroupUnits = new Map<
    string,
    { name: string; units: number; pageNumber?: number }
  >()

  contentPages.forEach((page, pageIndex) => {
    page.blocks.forEach((block, blockIndex) => {
      const group = block.semanticGroup
      if (group?.kind !== 'repeatable-page') return

      const allocation = page.allocations[blockIndex]
      const current = repeatableGroupUnits.get(group.id)
      repeatableGroupUnits.set(group.id, {
        name: group.name,
        units:
          (current?.units ?? 0) +
          (allocation?.baselineUnits ?? estimatePublicationBlockUnits(block)),
        pageNumber: current?.pageNumber ?? page.pageNumber,
      })
    })

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

  repeatableGroupUnits.forEach((group, groupId) => {
    if (group.units > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS) {
      diagnostics.push({
        code: 'repeatable-group-overflow',
        semanticGroupId: groupId,
        pageNumber: group.pageNumber,
        message: `Repeatable page “${group.name}” exceeds one page and needs a quick content or layout review.`,
      })
    }
  })

  return diagnostics
}

export function createPublicationLayout(publication: Publication): PublicationLayout {
  const contentPages = paginateBlocks(publication.content.blocks)
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
  const diagnostics = createDiagnostics(pages)

  return {
    settings: cloneDocumentSettings(publication.documentSettings),
    pages,
    health: diagnostics.length === 0 ? 'healthy' : 'needs-attention',
    diagnostics,
  }
}
