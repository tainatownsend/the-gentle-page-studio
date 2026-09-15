import type { PublicationContent } from './publicationContent'
import type { PublicationDocumentSettings } from './publicationDocumentSettings'

export type PublicationStatus = 'draft' | 'published'

export type Publication = {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  content: PublicationContent
  documentSettings: PublicationDocumentSettings
  createdAt: string
  updatedAt: string
}
