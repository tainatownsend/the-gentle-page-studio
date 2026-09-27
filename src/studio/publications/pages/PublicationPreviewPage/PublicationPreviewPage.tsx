import { useState, type CSSProperties, type ReactElement } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  History,
  Pencil,
  Printer,
} from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'

import { downloadFillablePublicationPdf } from '../../export'
import {
  createPublicationLayout,
  getPublicationPageLayoutRecipe,
  type PublicationLayoutBlockAllocation,
} from '../../layout'
import documentTheme from '../../styles/PublicationDocumentTheme.module.css'
import type {
  Publication,
  PublicationBlock,
  PublicationPageTemplate,
  PublicationTableCellControl,
} from '../../types'

import styles from './PublicationPreviewPage.module.css'

export type PublicationPreviewPageProps = {
  publication: Publication
  onBack: () => void
  onEdit: (blockId?: string) => void
  onHistory?: () => void
}

type PublicationBlockPreviewProps = {
  block: PublicationBlock
  allocatedUnits?: number
}

function renderTableCellControl(
  control: PublicationTableCellControl,
  blockId: string,
  rowIndex: number,
  columnIndex: number,
  controlIndex: number,
): ReactElement {
  const key = `${blockId}-row-${rowIndex}-column-${columnIndex}-control-${controlIndex}`

  if (control.kind === 'checkbox') {
    return (
      <span
        key={key}
        className={styles.checkboxMark}
        role="img"
        aria-label={`Checkbox in row ${rowIndex + 1}, column ${columnIndex + 1}`}
        data-table-cell-control="checkbox"
      />
    )
  }

  const responseAreaClassName = `${styles.responseArea} ${
    control.size === 'short'
      ? styles.responseAreaShort
      : control.size === 'medium'
        ? styles.responseAreaMedium
        : styles.responseAreaLong
  }`

  return (
    <div
      key={key}
      className={responseAreaClassName}
      role="img"
      aria-label={`Response field in row ${rowIndex + 1}, column ${columnIndex + 1}`}
      data-table-cell-control="response"
      data-response-size={control.size}
    />
  )
}

function countInteractiveFields(publication: Publication): number {
  let count = 0

  for (const block of publication.content.blocks) {
    if (
      block.type === 'multiline-text-field' ||
      block.type === 'checkbox-field' ||
      block.type === 'rating-field'
    ) {
      count += 1
      continue
    }

    if (block.type === 'table' && block.cellControls) {
      for (const row of block.cellControls) {
        for (const cell of row) {
          count += cell.length
        }
      }
    }
  }

  return count
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
      <div className={styles.checkboxField} data-publication-block="checkbox">
        <span className={styles.checkboxMark} aria-hidden="true" />
        <p className={styles.fieldLabel}>{block.text || 'Checkbox'}</p>
      </div>
    )
  }

  if (block.type === 'rating-field') {
    const values = Array.from(
      { length: Math.max(1, Math.floor(block.max - block.min) + 1) },
      (_, index) => block.min + index,
    )

    return (
      <section
        className={styles.ratingField}
        aria-label={block.text || 'Rating field'}
        data-publication-block="rating"
      >
        <p className={styles.fieldLabel}>{block.text || 'Rating'}</p>
        <div className={styles.ratingScale} aria-hidden="true">
          {values.map((value) => (
            <span key={value} className={styles.ratingOption}>
              <span className={styles.ratingMark} />
              <span className={styles.ratingValue}>{value}</span>
            </span>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === 'table') {
    return (
      <section className={styles.tableBlock} aria-label={block.text || 'Worksheet table'}>
        {block.text ? <p className={styles.fieldLabel}>{block.text}</p> : null}
        <div className={styles.tableScroll}>
          <table className={styles.publicationTable}>
            <thead>
              <tr>
                {block.columns.map((column, index) => (
                  <th key={`${block.id}-column-${index}`} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${block.id}-row-${rowIndex}`}>
                  {block.columns.map((_, columnIndex) => {
                    const cellText = row[columnIndex] ?? ''
                    const controls = block.cellControls?.[rowIndex]?.[columnIndex] ?? []

                    return (
                      <td key={`${block.id}-row-${rowIndex}-column-${columnIndex}`}>
                        {cellText ? <div>{cellText}</div> : null}
                        {controls.map((control, controlIndex) =>
                          renderTableCellControl(
                            control,
                            block.id,
                            rowIndex,
                            columnIndex,
                            controlIndex,
                          ),
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return <p className={styles.paragraph}>{block.text || 'Empty paragraph'}</p>
}


type PublicationTemplateContentProps = {
  blocks: readonly PublicationBlock[]
  allocations: readonly PublicationLayoutBlockAllocation[]
  pageTemplate?: PublicationPageTemplate
}

function BotanicalCorner({
  position,
}: {
  position: 'top-right' | 'bottom-left'
}): ReactElement {
  return (
    <svg
      className={`${styles.botanicalCorner} ${
        position === 'top-right' ? styles.botanicalTopRight : styles.botanicalBottomLeft
      }`}
      viewBox="0 0 180 180"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.botanicalStem} d="M18 162 C52 122 82 88 157 24" />
      <path className={styles.botanicalLeaf} d="M50 128 C26 120 20 97 25 78 C48 83 61 99 50 128 Z" />
      <path className={styles.botanicalLeafSoft} d="M78 101 C59 82 64 58 78 44 C96 58 102 78 78 101 Z" />
      <path className={styles.botanicalLeaf} d="M105 76 C105 51 124 38 143 37 C141 59 129 74 105 76 Z" />
      <path className={styles.botanicalLeafSoft} d="M128 52 C128 29 145 17 164 18 C161 39 151 50 128 52 Z" />
      <path className={styles.botanicalLeaf} d="M68 112 C83 91 105 91 121 101 C104 117 87 123 68 112 Z" />
    </svg>
  )
}

function renderPublicationBlock(
  block: PublicationBlock,
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const allocation = allocations.find((candidate) => candidate.blockId === block.id)

  return (
    <PublicationBlockPreview
      key={block.id}
      block={block}
      allocatedUnits={allocation?.allocatedUnits}
    />
  )
}

function renderGuidedFrameworkContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstCheckbox = blocks.findIndex((block) => block.type === 'checkbox-field')
  const lastCheckbox = blocks.map((block) => block.type).lastIndexOf('checkbox-field')

  if (firstCheckbox < 0 || lastCheckbox < firstCheckbox) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const leading = blocks.slice(0, firstCheckbox)
  const stateBlocks = blocks.slice(firstCheckbox, lastCheckbox + 1)
  const trailing = blocks.slice(lastCheckbox + 1)

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.stateGrid} data-template-region="state-grid">
        {stateBlocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

function renderEmergencyToolContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstStep = blocks.findIndex(
    (block) => block.type === 'heading' && block.level === 3,
  )

  if (firstStep < 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const intro = blocks.slice(0, firstStep)
  const steps: PublicationBlock[][] = []
  let currentStep: PublicationBlock[] = []

  for (const block of blocks.slice(firstStep)) {
    if (block.type === 'heading' && block.level === 3 && currentStep.length > 0) {
      steps.push(currentStep)
      currentStep = []
    }
    currentStep.push(block)
  }

  if (currentStep.length > 0) steps.push(currentStep)

  return (
    <div className={styles.content}>
      {intro.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.emergencySteps} data-template-region="emergency-steps">
        {steps.map((step, index) => (
          <section
            key={step[0]?.id ?? `emergency-step-${index}`}
            className={styles.emergencyStep}
            data-template-step={index + 1}
          >
            {step.map((block) => renderPublicationBlock(block, allocations))}
          </section>
        ))}
      </div>
    </div>
  )
}

function renderDailyCheckInContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const ratingBlocks = blocks.filter((block) => block.type === 'rating-field')
  const firstCheckbox = blocks.findIndex((block) => block.type === 'checkbox-field')
  const lastCheckbox = blocks.map((block) => block.type).lastIndexOf('checkbox-field')
  const ratingIds = new Set(ratingBlocks.map((block) => block.id))
  const inventoryHeadingIndex =
    firstCheckbox > 0 &&
    blocks[firstCheckbox - 1]?.type === 'heading' &&
    blocks[firstCheckbox - 1]?.level === 3
      ? firstCheckbox - 1
      : firstCheckbox
  const inventoryIds = new Set(
    firstCheckbox >= 0
      ? blocks
          .slice(Math.max(0, inventoryHeadingIndex), lastCheckbox + 1)
          .map((block) => block.id)
      : [],
  )

  const regularBlocks = blocks.filter(
    (block) => !ratingIds.has(block.id) && !inventoryIds.has(block.id),
  )
  const firstResponseIndex = regularBlocks.findIndex(
    (block) => block.type === 'multiline-text-field',
  )
  const headingAndDate =
    firstResponseIndex >= 0
      ? regularBlocks.slice(0, firstResponseIndex + 1)
      : regularBlocks
  const trailing =
    firstResponseIndex >= 0 ? regularBlocks.slice(firstResponseIndex + 1) : []

  return (
    <div className={styles.content}>
      {headingAndDate.map((block) => renderPublicationBlock(block, allocations))}

      {ratingBlocks.length > 0 ? (
        <div className={styles.dailyMetrics} data-template-region="daily-metrics">
          {ratingBlocks.map((block) => renderPublicationBlock(block, allocations))}
        </div>
      ) : null}

      {inventoryIds.size > 0 ? (
        <section className={styles.dailyInventory} data-template-region="daily-inventory">
          {blocks
            .filter((block) => inventoryIds.has(block.id))
            .map((block) => renderPublicationBlock(block, allocations))}
        </section>
      ) : null}

      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

function PublicationTemplateContent({
  blocks,
  allocations,
  pageTemplate,
}: PublicationTemplateContentProps): ReactElement {
  if (pageTemplate === 'guided-framework') {
    return renderGuidedFrameworkContent(blocks, allocations)
  }

  if (pageTemplate === 'emergency-tool') {
    return renderEmergencyToolContent(blocks, allocations)
  }

  if (pageTemplate === 'daily-check-in') {
    return renderDailyCheckInContent(blocks, allocations)
  }

  return (
    <div className={styles.content}>
      {blocks.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
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
  const contentPageCount = layout.pages.filter((page) => page.kind === 'content').length
  const interactiveFieldCount = countInteractiveFields(publication)
  const hasInteractiveFields = interactiveFieldCount > 0
  const isReadyToExport = layout.health === 'healthy'

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

                    <Button
                      variant="secondary"
                      startIcon={<Pencil size={18} />}
                      onClick={() => onEdit()}
                    >
                      Adjust publication
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

              <section
                className={isReadyToExport ? styles.readinessReady : styles.readinessReview}
                aria-labelledby="publication-readiness-title"
                data-layout-health={layout.health}
              >
                <div className={styles.readinessHeader}>
                  {isReadyToExport ? (
                    <CheckCircle2 size={20} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={20} aria-hidden="true" />
                  )}

                  <div>
                    <p id="publication-readiness-title" className={styles.readinessTitle}>
                      {isReadyToExport ? 'Ready to export' : 'Review suggested'}
                    </p>
                    <p className={styles.readinessSummary}>
                      {contentPageCount} {contentPageCount === 1 ? 'content page' : 'content pages'}
                      {interactiveFieldCount > 0
                        ? ` · ${interactiveFieldCount} interactive ${
                            interactiveFieldCount === 1 ? 'field' : 'fields'
                          }`
                        : ''}
                    </p>
                  </div>
                </div>

                {isReadyToExport ? (
                  <p className={styles.readinessDescription}>
                    Automatic layout checks found no composition issues that need attention. You can
                    export now or adjust the publication only if you prefer a different editorial choice.
                  </p>
                ) : (
                  <div className={styles.reviewDetails}>
                    <p className={styles.readinessDescription}>
                      The publication remains exportable. These are focused layout suggestions, not a
                      required page-by-page review.
                    </p>

                    <ol className={styles.diagnosticList} aria-label="Layout review suggestions">
                      {layout.diagnostics.map((diagnostic, index) => {
                        const page = layout.pages.find(
                          (candidate) => candidate.pageNumber === diagnostic.pageNumber,
                        )
                        const groupedBlockId = diagnostic.semanticGroupId
                          ? publication.content.blocks.find(
                              (block) => block.semanticGroup?.id === diagnostic.semanticGroupId,
                            )?.id
                          : undefined
                        const reviewBlockId =
                          diagnostic.blockId ?? groupedBlockId ?? page?.blocks[0]?.id

                        return (
                          <li
                            key={`${diagnostic.code}-${diagnostic.pageNumber ?? 'document'}-${diagnostic.blockId ?? diagnostic.semanticGroupId ?? index}`}
                            className={styles.diagnosticItem}
                          >
                            <div>
                              <p className={styles.diagnosticLabel}>
                                {diagnostic.pageNumber !== undefined
                                  ? `Page ${diagnostic.pageNumber}`
                                  : 'Publication'}
                              </p>
                              <p>{diagnostic.message}</p>
                            </div>

                            <div className={styles.diagnosticActions}>
                              {diagnostic.pageNumber !== undefined ? (
                                <a
                                  className={styles.pageLink}
                                  href={`#publication-page-${diagnostic.pageNumber}`}
                                >
                                  View page {diagnostic.pageNumber}
                                </a>
                              ) : null}

                              {reviewBlockId ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => onEdit(reviewBlockId)}
                                >
                                  Adjust this item
                                </Button>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ol>

                    <Button type="button" variant="secondary" onClick={() => onEdit()}>
                      Review all adjustments
                    </Button>
                  </div>
                )}
              </section>

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
              const pageRecipe = isCover
                ? undefined
                : getPublicationPageLayoutRecipe(layoutPage.blocks)

              return (
                <article
                  key={layoutPage.id}
                  id={
                    layoutPage.pageNumber !== undefined
                      ? `publication-page-${layoutPage.pageNumber}`
                      : undefined
                  }
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
                  data-page-archetype={pageRecipe?.archetype}
                  data-page-density={pageRecipe?.density}
                  data-page-template={layoutPage.pageTemplate}
                >
                  {isCover ? (
                    <div className={styles.coverBody}>
                      <BotanicalCorner position="top-right" />
                      <BotanicalCorner position="bottom-left" />
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
                        <PublicationTemplateContent
                          blocks={layoutPage.blocks}
                          allocations={layoutPage.allocations}
                          pageTemplate={layoutPage.pageTemplate}
                        />
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
