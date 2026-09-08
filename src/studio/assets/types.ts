export type StudioAsset = {
  id: string
  name: string
  mimeType: string
  size: number
  dataUrl: string
  createdAt: string
}

export const MAX_ASSET_BYTES = 1_500_000
export const ACCEPTED_ASSET_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
