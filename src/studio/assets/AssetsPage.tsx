import { useState, type ChangeEvent, type ReactElement } from 'react'
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'

import { useAssetsLibrary } from './useAssetsLibrary'
import styles from './AssetsPage.module.css'

export type AssetsPageProps = {
  onBack: () => void
}

export function AssetsPage({ onBack }: AssetsPageProps): ReactElement {
  const { assets, addAsset, deleteAsset } = useAssetsLibrary()
  const [error, setError] = useState<string>()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(undefined)
    const result = await addAsset(file)
    if (!result.ok) setError(result.error)
  }

  return (
    <main className={styles.page}>
      <Container size="lg">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Asset library"
            description="Keep reusable Gentle Page imagery in one local workspace."
            actions={
              <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                Back to publications
              </Button>
            }
          />

          <Card as="section" padding="lg">
            <Stack gap="md">
              <Stack gap="xs">
                <Text as="h2" variant="h2" weight="semibold">
                  Add an image
                </Text>
                <Text tone="secondary">
                  PNG, JPEG, or WebP. Local MVP limit: 1.5 MB per image.
                </Text>
              </Stack>

              <label className={styles.uploadControl}>
                <ImagePlus size={18} />
                <span>Add image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />
              </label>

              {error ? (
                <Text role="alert" tone="danger">
                  {error}
                </Text>
              ) : null}
            </Stack>
          </Card>

          {assets.length === 0 ? (
            <Card as="section" padding="lg" className={styles.emptyState}>
              <Stack gap="xs">
                <Text weight="semibold">No assets yet</Text>
                <Text tone="secondary">
                  Add reusable artwork, covers, or decorative imagery when you need it.
                </Text>
              </Stack>
            </Card>
          ) : (
            <ul className={styles.grid} aria-label="Studio assets">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <Card as="article" padding="md">
                    <Stack gap="md">
                      <img className={styles.preview} src={asset.dataUrl} alt="" />
                      <Stack gap="xs">
                        <Text weight="semibold">{asset.name}</Text>
                        <Text tone="secondary">{Math.ceil(asset.size / 1024)} KB</Text>
                      </Stack>
                      <Button
                        variant="ghost"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => deleteAsset(asset.id)}
                      >
                        Delete asset
                      </Button>
                    </Stack>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Stack>
      </Container>
    </main>
  )
}
