export type PublicationStatus = 'draft' | 'published'

export type Publication = {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  createdAt: string
  updatedAt: string
}
