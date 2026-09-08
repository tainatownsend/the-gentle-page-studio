import type { PublicationContent } from './publicationContent'
import type { PublicationDocumentSettings } from './publicationDocumentSettings'

export type PublicationRevision = {
  id: string
  publicationId: string
  title: string
  description?: string
  content: PublicationContent
  documentSettings: PublicationDocumentSettings
  publishedAt: string
}
