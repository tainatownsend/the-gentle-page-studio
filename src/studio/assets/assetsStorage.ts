import type { StudioAsset } from './types'

export const ASSETS_STORAGE_KEY = 'the-gentle-page-studio.assets.v1'

export function loadAssets(): StudioAsset[] {
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAssets(assets: readonly StudioAsset[]): void {
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets))
}
