import type {
  Publication,
  PublicationBlock,
  PublicationDocumentSettings,
} from '../types'

export type PublicationLayoutPageKind = 'cover' | 'content'

export type PublicationLayoutPage = {
  id: string
  sequence: number
  kind: PublicationLayoutPageKind
  pageNumber?: number
  blocks: PublicationBlock[]
}

export type PublicationLayout = {
  settings: PublicationDocumentSettings
  pages: PublicationLayoutPage[]
}

export const PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS = 48

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

export function estimatePublicationBlockUnits(block: PublicationBlock): number {
  const textLength = Math.max(block.text.trim().length, 1)

  switch (block.type) {
    case 'heading':
      return 5 + Math.ceil(textLength / 45) * 2
    case 'paragraph':
      return 3 + Math.ceil(textLength / 70) * 3
    case 'multiline-text-field':
      return 14 + Math.ceil(textLength / 70) * 2
    case 'checkbox-field':
      return 5 + Math.ceil(textLength / 70) * 2
  }
}

function paginateBlocks(blocks: readonly PublicationBlock[]): PublicationBlock[][] {
  if (blocks.length === 0) {
    return [[]]
  }

  const pages: PublicationBlock[][] = []
  let currentPage: PublicationBlock[] = []
  let currentUnits = 0

  for (const block of blocks) {
    const blockUnits = estimatePublicationBlockUnits(block)
    const shouldStartNewPage =
      currentPage.length > 0 &&
      currentUnits + blockUnits > PUBLICATION_CONTENT_PAGE_CAPACITY_UNITS

    if (shouldStartNewPage) {
      pages.push(currentPage)
      currentPage = []
      currentUnits = 0
    }

    currentPage.push({
      ...block,
    })
    currentUnits += blockUnits
  }

  pages.push(currentPage)

  return pages
}

export function createPublicationLayout(
  publication: Publication,
): PublicationLayout {
  const contentPages = paginateBlocks(publication.content.blocks)

  return {
    settings: cloneDocumentSettings(publication.documentSettings),
    pages: [
      {
        id: `${publication.id}-cover`,
        sequence: 1,
        kind: 'cover',
        blocks: [],
      },
      ...contentPages.map((blocks, index) => ({
        id: `${publication.id}-content-page-${index + 1}`,
        sequence: index + 2,
        kind: 'content' as const,
        pageNumber: index + 1,
        blocks,
      })),
    ],
  }
}
