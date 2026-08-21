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

export function createPublicationLayout(
  publication: Publication,
): PublicationLayout {
  return {
    settings: cloneDocumentSettings(publication.documentSettings),
    pages: [
      {
        id: `${publication.id}-cover`,
        sequence: 1,
        kind: 'cover',
        blocks: [],
      },
      {
        id: `${publication.id}-content-page-1`,
        sequence: 2,
        kind: 'content',
        pageNumber: 1,
        blocks: publication.content.blocks.map((block) => ({
          ...block,
        })),
      },
    ],
  }
}
