import { useState, type CSSProperties, type ReactElement } from 'react'
import { AlertCircle, ArrowLeft, Download, History, Pencil, Printer } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'

import { downloadFillablePublicationPdf } from '../../export'
import { createPublicationLayout } from '../../layout'
import documentTheme from '../../styles/PublicationDocumentTheme.module.css'
import type { Publication, PublicationBlock } from '../../types'

import styles from './PublicationPreviewPage.module.css'

export type PublicationPreviewPageProps = {
  publication: Publication
  onBack: () => void
  onEdit: () => void
  onHistory?: () => void
}

type PublicationBlockPreviewProps = {
  block: PublicationBlock
  allocatedUnits?: number
}

function PublicationBlockPreview({
  block,
  allocatedUnits,
}: PublicationBlockPreviewProps): ReactElement {
  if (block.type === 'heading') {
    const HeadingTag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4'
    const headingClassName =
      block.level === 1
        ? styles.heading1
        : block.level === 2
          ? styles.heading2
          : styles.heading3

    return (
      <HeadingTag className={headingClassName}>
        {block.text || 'Untitled heading'}
      </HeadingTag>
    )
  }

  if (block.type === 'multiline-text-field') {
    const responseSize = block.responseSize ?? 'long'
    const responseAreaClassName = `${styles.responseArea} ${
      responseSize === 'short'
        ? styles.responseAreaShort
        : responseSize === 'medium'
          ? styles.responseAreaMedium
          : styles.responseAreaLong
    }`
    const responseAreaStyle = {
      '--response-area-units': allocatedUnits ?? 14,
    } as CSSProperties

    return (
      <section
        className={styles.multilineField}
        aria-label={block.text || 'Response field'}
        data-response-size={responseSize}
        data-allocated-units={allocatedUnits}
      >
        <p className={styles.fieldLabel}>{block.text || 'Response'}</p>
        <div className={responseAreaClassName} style={responseAreaStyle} aria-hidden="true" />
      </section>
    )
  }

  if (block.type === 'checkbox-field') {
    return (
      <div className={styles.checkboxField}>
        <span className={styles.checkboxMark} aria-hidden="true" />
        <p className={styles.fieldLabel}>{block.text || 'Checkbox'}</p>
      </div>
    )
  }

  return <p className={styles.paragraph}>{block.text || 'Empty paragraph'}</p>
}

export function PublicationPreviewPage({
  publication,
  onBack,
  onEdit,
  onHistory,
}: PublicationPreviewPageProps): ReactElement {
  const [isDownloadingFillablePdf, setIsDownloadingFillablePdf] = useState(false)
  const [fillablePdfError, setFillablePdfError] = useState<string>()
  const layout = createPublicationLayout(publication)
  const hasInteractiveFields = publication.content.blocks.some(
    (block) => block.type === 'multiline-text-field' || block.type === 'checkbox-field',
  )

  function handlePrint() {
    globalThis.print()
  }

  async function handleDownloadFillablePdf() {
    if (isDownloadingFillablePdf) {
      return
    }

    setFillablePdfError(undefined)
    setIsDownloadingFillablePdf(true)

    try {
      await downloadFillablePublicationPdf(publication)
    } catch {
      setFillablePdfError(
        'The fillable PDF could not be prepared. Your publication is unchanged. Please try again.',
      )
    } finally {
      setIsDownloadingFillablePdf(false)
    }
  }

  return (
    <main className={styles.page}>
      <Container size="lg" className={styles.previewContainer}>
        <Stack gap="xl" className={styles.previewStack}>
          <div className={styles.previewControls}>
            <Stack gap="md">
              <PageHeader
                eyebrow="Publication preview"
                title={publication.title}
                description={
                  publication.status === 'published' ? 'Published preview' : 'Draft preview'
                }
                actions={
                  <Cluster gap="sm">
                    <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                      Back to publications
                    </Button>

                    <Button variant="secondary" startIcon={<Pencil size={18} />} onClick={onEdit}>
                      Edit publication
                    </Button>

                    {onHistory ? (
                      <Button
                        variant="secondary"
                        startIcon={<History size={18} />}
                        onClick={onHistory}
                      >
                        Version history
                      </Button>
                    ) : null}

                    {hasInteractiveFields ? (
                      <Button
                        variant="secondary"
                        startIcon={<Download size={18} />}
                        disabled={isDownloadingFillablePdf}
                        onClick={() => void handleDownloadFillablePdf()}
                      >
                        {isDownloadingFillablePdf
                          ? 'Preparing fillable PDF…'
                          : 'Download fillable PDF'}
                      </Button>
                    ) : null}

                    <Button startIcon={<Printer size={18} />} onClick={handlePrint}>
                      Print / Save as PDF
                    </Button>
                  </Cluster>
                }
              />

              {layout.health === 'needs-attention' ? (
                <div className={styles.layoutNotice} role="status">
                  <AlertCircle size={18} aria-hidden="true" />
                  <div>
                    <p className={styles.noticeTitle}>Layout review suggested</p>
                    <p>
                      Automatic pagination resolved most geometry, but {layout.diagnostics.length}{' '}
                      {layout.diagnostics.length === 1 ? 'item still needs' : 'items still need'} a quick
                      review.
                    </p>
                  </div>
                </div>
              ) : null}

              {fillablePdfError ? (
                <div className={styles.exportError} role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <p>{fillablePdfError}</p>
                </div>
              ) : null}
            </Stack>
          </div>

          <section className={styles.previewViewport} aria-label="Print-oriented publication preview">
            {layout.pages.map((layoutPage) => {
              const isCover = layoutPage.kind === 'cover'
              const hasContent = layoutPage.blocks.length > 0

              return (
                <article
                  key={layoutPage.id}
                  className={`${styles.documentPage} ${documentTheme.theme}`}
                  aria-label={
                    isCover
                      ? 'Publication cover'
                      : `Publication content page ${layoutPage.pageNumber ?? layoutPage.sequence}`
                  }
                  data-page-kind={layoutPage.kind}
                  data-page-size={layout.settings.pageSize}
                  data-orientation={layout.settings.orientation}
                  data-layout-remaining-units={layoutPage.remainingUnits}
                >
                  {isCover ? (
                    <div className={styles.coverBody}>
                      <p className={styles.coverBrand}>The Gentle Page</p>

                      <div className={styles.coverTitleGroup}>
                        <h1 id="publication-preview-title" className={styles.coverTitle}>
                          {publication.title}
                        </h1>

                        {publication.description ? (
                          <p className={styles.coverDescription}>{publication.description}</p>
                        ) : null}
                      </div>

                      <p className={styles.coverTagline}>
                        Thoughtfully designed tools for everyday clarity.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.documentBody}>
                      {hasContent ? (
                        <div className={styles.content}>
                          {layoutPage.blocks.map((block) => {
                            const allocation = layoutPage.allocations.find(
                              (candidate) => candidate.blockId === block.id,
                            )

                            return (
                              <PublicationBlockPreview
                                key={block.id}
                                block={block}
                                allocatedUnits={allocation?.allocatedUnits}
                              />
                            )
                          })}
                        </div>
                      ) : (
                        <div className={styles.emptyState}>
                          <p className={styles.emptyTitle}>Nothing to preview yet</p>
                          <p className={styles.emptyDescription}>
                            Add content blocks in the editor to build this publication.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {layoutPage.pageNumber !== undefined ? (
                    <footer
                      className={styles.pageNumber}
                      aria-label={`Page ${layoutPage.pageNumber}`}
                    >
                      {layoutPage.pageNumber}
                    </footer>
                  ) : null}
                </article>
              )
            })}
          </section>
        </Stack>
      </Container>
    </main>
  )
}
