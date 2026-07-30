export type PublicationStatus = 'draft' | 'published'

export type Publication = {
  id: string
  title: string
  description?: string
  updatedAt?: string
  status: PublicationStatus
}
