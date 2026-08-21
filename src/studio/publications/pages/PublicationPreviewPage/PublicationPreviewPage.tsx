import type { ReactElement } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'

import { createPublicationLayout } from '../../layout'
import type { Publication, PublicationBlock } from '../../types'

import styles from './PublicationPreviewPage.module.css'

export type PublicationPreviewPageProps = {
  publication: Publication
  onBack: () => void
  onEdit: () => void
}

type PublicationBlockPreviewProps = {
  block: PublicationBlock
}

function PublicationBlockPreview({ block }: PublicationBlockPreviewProps): ReactElement {
  if (block.type === 'heading') {
    const HeadingTag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4'

    return (
      <Text
        as={HeadingTag}
        variant={block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'body'}
        weight="semibold"
      >
        {block.text || 'Untitled heading'}
      </Text>
    )
  }

  return (
    <Text as="p" className={styles.paragraph}>
      {block.text || 'Empty paragraph'}
    </Text>
  )
}

export function PublicationPreviewPage({
  publication,
  onBack,
  onEdit,
}: PublicationPreviewPageProps): ReactElement {
  const layout = createPublicationLayout(publication)
  const contentPage = layout.pages[0]
  const hasContent = (contentPage?.blocks.length ?? 0) > 0

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

          <section className={styles.previewViewport} aria-label="Print-oriented publication preview">
            {layout.pages.map((layoutPage) => (
              <article
                key={layoutPage.id}
                className={styles.documentPage}
                aria-label={`Publication page ${layoutPage.sequence}`}
                data-page-size={layout.settings.pageSize}
                data-orientation={layout.settings.orientation}
              >
                <div className={styles.documentBody}>
                  <Stack gap="xl">
                    <header className={styles.documentHeader}>
                      <Text
                        as="h1"
                        id="publication-preview-title"
                        variant="h1"
                        weight="semibold"
                      >
                        {publication.title}
                      </Text>

                      {publication.description ? (
                        <Text tone="secondary">{publication.description}</Text>
                      ) : null}
                    </header>

                    {hasContent ? (
                      <div className={styles.content}>
                        {layoutPage.blocks.map((block) => (
                          <PublicationBlockPreview key={block.id} block={block} />
                        ))}
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
                </div>

                <footer className={styles.pageNumber} aria-label={`Page ${layoutPage.sequence}`}>
                  {layoutPage.sequence}
                </footer>
              </article>
            ))}
          </section>
        </Stack>
      </Container>
    </main>
  )
}
