import type { ReactElement } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'

import type { Publication } from '../../types'

import styles from './PublicationPreviewPage.module.css'

export type PublicationPreviewPageProps = {
  publication: Publication
  onBack: () => void
  onEdit: () => void
}

export function PublicationPreviewPage({
  publication,
  onBack,
  onEdit,
}: PublicationPreviewPageProps): ReactElement {
  const hasContent = publication.content.blocks.length > 0

  return (
    <main className={styles.page}>
      <Container size="lg">
        <Stack gap="xl">
          <PageHeader
            eyebrow="Publication preview"
            title={publication.title}
            description={publication.status === 'published' ? 'Published preview' : 'Draft preview'}
            actions={
              <Cluster gap="sm">
                <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                  Back to publications
                </Button>

                <Button variant="secondary" startIcon={<Pencil size={18} />} onClick={onEdit}>
                  Edit publication
                </Button>
              </Cluster>
            }
          />

          <Card
            as="article"
            padding="lg"
            className={styles.document}
            aria-labelledby="publication-preview-title"
          >
            <Stack gap="xl">
              <header className={styles.documentHeader}>
                <Text as="h1" id="publication-preview-title" variant="h1" weight="semibold">
                  {publication.title}
                </Text>

                {publication.description ? (
                  <Text tone="secondary">{publication.description}</Text>
                ) : null}
              </header>

              {hasContent ? (
                <div className={styles.content}>
                  {publication.content.blocks.map((block) => {
                    if (block.type === 'heading') {
                      const HeadingTag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4'

                      return (
                        <Text
                          key={block.id}
                          as={HeadingTag}
                          variant={block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'body'}
                          weight="semibold"
                        >
                          {block.text || 'Untitled heading'}
                        </Text>
                      )
                    }

                    return (
                      <Text key={block.id} as="p" className={styles.paragraph}>
                        {block.text || 'Empty paragraph'}
                      </Text>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Stack gap="xs">
                    <Text weight="semibold">Nothing to preview yet</Text>
                    <Text tone="secondary">
                      Add headings and paragraphs in the editor to build this publication.
                    </Text>
                  </Stack>
                </div>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>
    </main>
  )
}
