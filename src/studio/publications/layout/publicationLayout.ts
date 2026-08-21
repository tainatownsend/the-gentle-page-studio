import type {
  Publication,
  PublicationBlock,
  PublicationDocumentSettings,
} from '../types'

export type PublicationLayoutPageKind = 'content'

export type PublicationLayoutPage = {
  id: string
  sequence: number
  kind: PublicationLayoutPageKind
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
        id: `${publication.id}-content-page-1`,
        sequence: 1,
        kind: 'content',
        blocks: publication.content.blocks.map((block) => ({
          ...block,
        })),
      },
    ],
  }
}
