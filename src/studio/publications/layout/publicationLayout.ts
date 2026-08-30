import type {
  Publication,
  PublicationBlock,
  PublicationDocumentSettings,
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
  code: 'oversized-block' | 'sparse-page'
  message: string
  pageNumber?: number
  blockId?: string
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
  return {
    ...block,
    layout: block.layout ? { ...block.layout } : undefined,
  }
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

function getCheckboxRun(
  blocks: readonly PublicationBlock[],
  startIndex: number,
): { length: number; units: number } {
  if (blocks[startIndex]?.type !== 'checkbox-field') {
    return { length: 0, units: 0 }
  }

  let length = 0
  let units = 0

  for (let index = startIndex; index < blocks.length; index += 1) {
    const candidate = blocks[index]

    if (!candidate || candidate.type !== 'checkbox-field') {
      break
    }

    length += 1
    units += estimatePublicationBlockUnits(candidate)
  }

  return { length, units }
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

    const checkboxRun = getCheckboxRun(blocks, index)
    const wouldSplitCompactCheckboxRun =
      currentPage.length > 0 &&
      checkboxRun.length >= 2 &&
      checkboxRun.units <= PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS &&
      currentUnits + checkboxRun.units > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    const forcedBreak = currentPage.length > 0 && block.layout?.pageBreakBefore === 'forced'
    const preferredBreak =
      currentPage.length > 0 &&
      block.layout?.pageBreakBefore === 'preferred' &&
      currentUnits >= PREFERRED_PAGE_BREAK_MINIMUM_FILL_UNITS
    const capacityBreak =
      currentPage.length > 0 &&
      currentUnits + blockUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    if (
      forcedBreak ||
      preferredBreak ||
      wouldOrphanKeepWithNextBlock ||
      wouldSplitCompactCheckboxRun ||
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

    if (
      !isFinalPage &&
      !startsWithForcedBreak &&
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
