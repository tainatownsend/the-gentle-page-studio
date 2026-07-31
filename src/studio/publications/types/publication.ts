import type { PublicationContent } from './publicationContent'

export type PublicationStatus = 'draft' | 'published'

export type Publication = {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  content: PublicationContent
  createdAt: string
  updatedAt: string
}
