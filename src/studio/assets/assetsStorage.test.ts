import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ASSETS_STORAGE_KEY, loadAssets, saveAssets } from './assetsStorage'
import type { StudioAsset } from './types'

const asset: StudioAsset = {
  id: 'asset-1',
  name: 'cover.png',
  mimeType: 'image/png',
  size: 1024,
  dataUrl: 'data:image/png;base64,AAAA',
  createdAt: '2026-08-22T00:00:00.000Z',
}

describe('assetsStorage', () => {
  beforeEach(() => localStorage.clear())

  it('persists and restores assets', () => {
    saveAssets([asset])
    expect(loadAssets()).toEqual([asset])
  })

  it('reports a quota failure without throwing', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    expect(saveAssets([asset])).toBe(false)
    setItem.mockRestore()
  })

  it('falls back safely when stored JSON is invalid', () => {
    localStorage.setItem(ASSETS_STORAGE_KEY, '{')
    expect(loadAssets()).toEqual([])
  })
})
