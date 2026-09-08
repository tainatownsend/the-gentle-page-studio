import type { PublicationContent } from './publicationContent'

export type PublicationTemplate = {
  id: string
  name: string
  description: string
  content: PublicationContent
}
