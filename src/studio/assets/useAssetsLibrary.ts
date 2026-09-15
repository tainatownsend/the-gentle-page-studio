import { useCallback, useEffect, useMemo, useState } from 'react'

import { loadAssets, saveAssets } from './assetsStorage'
import {
  ACCEPTED_ASSET_TYPES,
  MAX_ASSET_BYTES,
  type StudioAsset,
} from './types'

function createAssetId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read asset.'))
    reader.readAsDataURL(file)
  })
}

export type AddAssetResult =
  | { ok: true; asset: StudioAsset }
  | { ok: false; error: string }

export function useAssetsLibrary() {
  const [assets, setAssets] = useState<StudioAsset[]>(loadAssets)

  useEffect(() => {
    saveAssets(assets)
  }, [assets])

  const addAsset = useCallback(async (file: File): Promise<AddAssetResult> => {
    if (!ACCEPTED_ASSET_TYPES.includes(file.type as (typeof ACCEPTED_ASSET_TYPES)[number])) {
      return { ok: false, error: 'Use a PNG, JPEG, or WebP image.' }
    }

    if (file.size > MAX_ASSET_BYTES) {
      return { ok: false, error: 'Keep each image under 1.5 MB for the local MVP.' }
    }

    try {
      const asset: StudioAsset = {
        id: createAssetId(),
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: await readFileAsDataUrl(file),
        createdAt: new Date().toISOString(),
      }

      setAssets((current) => [asset, ...current])
      return { ok: true, asset }
    } catch {
      return { ok: false, error: 'The image could not be added. Try another file.' }
    }
  }, [])

  const deleteAsset = useCallback((assetId: string) => {
    setAssets((current) => current.filter((asset) => asset.id !== assetId))
  }, [])

  return useMemo(
    () => ({ assets, addAsset, deleteAsset }),
    [assets, addAsset, deleteAsset],
  )
}
