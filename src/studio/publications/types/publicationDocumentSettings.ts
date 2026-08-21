export type PublicationPageSize = 'us-letter'

export type PublicationOrientation = 'portrait'

export type PublicationMargins = {
  top: number
  right: number
  bottom: number
  left: number
}

export type PublicationDocumentSettings = {
  pageSize: PublicationPageSize
  orientation: PublicationOrientation
  margins: PublicationMargins
}

export const DEFAULT_PUBLICATION_MARGIN_INCHES = 0.75

export function createDefaultPublicationDocumentSettings(): PublicationDocumentSettings {
  return {
    pageSize: 'us-letter',
    orientation: 'portrait',
    margins: {
      top: DEFAULT_PUBLICATION_MARGIN_INCHES,
      right: DEFAULT_PUBLICATION_MARGIN_INCHES,
      bottom: DEFAULT_PUBLICATION_MARGIN_INCHES,
      left: DEFAULT_PUBLICATION_MARGIN_INCHES,
    },
  }
}
