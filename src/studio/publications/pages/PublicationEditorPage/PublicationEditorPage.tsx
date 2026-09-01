import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Plus, Save, Trash2 } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Field } from '@/design-system/primitives/Field'
import { Input } from '@/design-system/primitives/Input'
import { Select } from '@/design-system/primitives/Select'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { Textarea } from '@/design-system/primitives/Textarea'

import type {
  Publication,
  PublicationBlock,
  PublicationContent,
  PublicationHeadingBlock,
  PublicationHeadingLevel,
  PublicationPageBreakIntent,
  PublicationResponseSizeIntent,
  PublicationStatus,
} from '../../types'

import styles from './PublicationEditorPage.module.css'

export type PublicationEditorValues = {
  title: string
  description?: string
  status: PublicationStatus
  content: PublicationContent
}

export type PublicationEditorPageProps = {
  publication: Publication
  recoveredDraft?: PublicationEditorValues
  onBack: () => void
  onSave: (values: PublicationEditorValues) => void
  onDraftAutosave?: (values: PublicationEditorValues) => void
  onDraftDiscard?: () => void
}

type UnsavedChangesConfirmationProps = {
  onKeepEditing: () => void
  onDiscard: () => void
}

type PagePlacementValue = 'auto' | PublicationPageBreakIntent

function createBlockId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createHeadingBlock(): PublicationHeadingBlock {
  return {
    id: createBlockId(),
    type: 'heading',
    level: 2,
    text: '',
  }
}

function createParagraphBlock(): PublicationBlock {
  return {
    id: createBlockId(),
    type: 'paragraph',
    text: '',
  }
}

function createMultilineTextFieldBlock(): PublicationBlock {
  return {
    id: createBlockId(),
    type: 'multiline-text-field',
    text: '',
    responseSize: 'medium',
  }
}

function createCheckboxFieldBlock(): PublicationBlock {
  return {
    id: createBlockId(),
    type: 'checkbox-field',
    text: '',
  }
}

function getBlockTypeLabel(block: PublicationBlock): string {
  switch (block.type) {
    case 'heading':
      return 'Heading'
    case 'paragraph':
      return 'Paragraph'
    case 'multiline-text-field':
      return 'Multiline response'
    case 'checkbox-field':
      return 'Checkbox'
    case 'rating-field':
      return 'Rating'
    case 'table':
      return 'Table'
  }
}

function cloneBlock(block: PublicationBlock): PublicationBlock {
  if (block.type === 'table') {
    return {
      ...block,
      columns: [...block.columns],
      rows: block.rows.map((row) => [...row]),
      layout: block.layout ? { ...block.layout } : undefined,
    }
  }

  return {
    ...block,
    layout: block.layout ? { ...block.layout } : undefined,
  }
}

function cloneContent(content: PublicationContent): PublicationContent {
  return {
    blocks: content.blocks.map(cloneBlock),
  }
}

function normalizeContent(content: PublicationContent): PublicationContent {
  return {
    blocks: content.blocks.map((block) => ({
      ...cloneBlock(block),
      text: block.text.trim(),
    })),
  }
}

function layoutMatches(currentBlock: PublicationBlock, savedBlock: PublicationBlock): boolean {
  return (
    currentBlock.layout?.pageBreakBefore === savedBlock.layout?.pageBreakBefore &&
    currentBlock.layout?.keepWithNext === savedBlock.layout?.keepWithNext
  )
}

function tableMatches(
  currentBlock: Extract<PublicationBlock, { type: 'table' }>,
  savedBlock: Extract<PublicationBlock, { type: 'table' }>,
): boolean {
  if (currentBlock.columns.length !== savedBlock.columns.length) {
    return false
  }

  if (!currentBlock.columns.every((column, index) => column === savedBlock.columns[index])) {
    return false
  }

  if (currentBlock.rows.length !== savedBlock.rows.length) {
    return false
  }

  return currentBlock.rows.every((row, rowIndex) => {
    const savedRow = savedBlock.rows[rowIndex]

    return (
      savedRow !== undefined &&
      row.length === savedRow.length &&
      row.every((cell, columnIndex) => cell === savedRow[columnIndex])
    )
  })
}

function contentMatches(
  currentContent: PublicationContent,
  savedContent: PublicationContent,
): boolean {
  if (currentContent.blocks.length !== savedContent.blocks.length) {
    return false
  }

  return currentContent.blocks.every((currentBlock, index) => {
    const savedBlock = savedContent.blocks[index]

    if (
      !savedBlock ||
      currentBlock.id !== savedBlock.id ||
      currentBlock.type !== savedBlock.type ||
      currentBlock.text.trim() !== savedBlock.text.trim() ||
      !layoutMatches(currentBlock, savedBlock)
    ) {
      return false
    }

    if (currentBlock.type === 'heading' && savedBlock.type === 'heading') {
      return currentBlock.level === savedBlock.level
    }

    if (
      currentBlock.type === 'multiline-text-field' &&
      savedBlock.type === 'multiline-text-field'
    ) {
      return currentBlock.responseSize === savedBlock.responseSize
    }

    if (currentBlock.type === 'rating-field' && savedBlock.type === 'rating-field') {
      return currentBlock.min === savedBlock.min && currentBlock.max === savedBlock.max
    }

    if (currentBlock.type === 'table' && savedBlock.type === 'table') {
      return tableMatches(currentBlock, savedBlock)
    }

    return true
  })
}

function getPagePlacementValue(block: PublicationBlock): PagePlacementValue {
  return block.layout?.pageBreakBefore ?? 'auto'
}

function withPagePlacement(
  block: PublicationBlock,
  pagePlacement: PagePlacementValue,
): PublicationBlock {
  if (pagePlacement === 'auto') {
    const keepWithNext = block.layout?.keepWithNext

    return {
      ...block,
      layout: keepWithNext === undefined ? undefined : { keepWithNext },
    }
  }

  return {
    ...block,
    layout: {
      ...block.layout,
      pageBreakBefore: pagePlacement,
    },
  }
}

function parseTableColumns(value: string): string[] {
  return value
    .split('\n')
    .map((cell) => cell.trim())
    .filter(Boolean)
}

function serializeTableRows(rows: string[][]): string {
  return rows.map((row) => row.join('\t')).join('\n')
}

function parseTableRows(value: string, columnCount: number): string[][] {
  return value
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = line.split('\t').map((cell) => cell.trim())
      return Array.from({ length: columnCount }, (_, index) => cells[index] ?? '')
    })
}

function UnsavedChangesConfirmation({
  onKeepEditing,
  onDiscard,
}: UnsavedChangesConfirmationProps): ReactElement {
  const keepEditingButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    keepEditingButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onKeepEditing()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onKeepEditing])

  return (
    <div className={styles.dialogBackdrop}>
      <section
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
      >
        <Stack gap="md">
          <Stack gap="sm">
            <Text as="h2" id="unsaved-changes-title" variant="h2" weight="semibold">
              Discard unsaved changes?
            </Text>

            <Text id="unsaved-changes-description" tone="secondary">
              Your changes have not been saved. Discarding them will restore the last saved version.
            </Text>
          </Stack>

          <div className={styles.dialogActions}>
            <Button ref={keepEditingButtonRef} variant="secondary" onClick={onKeepEditing}>
              Keep editing
            </Button>

            <Button variant="ghost" onClick={onDiscard}>
              Discard changes
            </Button>
          </div>
        </Stack>
      </section>
    </div>
  )
}

export function PublicationEditorPage({
  publication,
  recoveredDraft,
  onBack,
  onSave,
  onDraftAutosave,
  onDraftDiscard,
}: PublicationEditorPageProps): ReactElement {
  const [title, setTitle] = useState(recoveredDraft?.title ?? publication.title)
  const [description, setDescription] = useState(
    recoveredDraft?.description ?? publication.description ?? '',
  )
  const [status, setStatus] = useState<PublicationStatus>(
    recoveredDraft?.status ?? publication.status,
  )
  const [content, setContent] = useState<PublicationContent>(() =>
    cloneContent(recoveredDraft?.content ?? publication.content),
  )
  const [titleError, setTitleError] = useState<string>()
  const [isConfirmingExit, setIsConfirmingExit] = useState(false)

  const normalizedTitle = title.trim()
  const normalizedDescription = description.trim()
  const savedDescription = publication.description ?? ''

  const hasUnsavedChanges =
    normalizedTitle !== publication.title ||
    normalizedDescription !== savedDescription ||
    status !== publication.status ||
    !contentMatches(content, publication.content)

  useEffect(() => {
    if (!hasUnsavedChanges || !onDraftAutosave) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      onDraftAutosave({
        title,
        description: description || undefined,
        status,
        content: cloneContent(content),
      })
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [content, description, hasUnsavedChanges, onDraftAutosave, status, title])

  function markAsDraftAfterEdit() {
    setStatus((currentStatus) => (currentStatus === 'published' ? 'draft' : currentStatus))
  }

  function updateBlock(blockId: string, update: (block: PublicationBlock) => PublicationBlock) {
    markAsDraftAfterEdit()

    setContent((current) => ({
      blocks: current.blocks.map((block) => (block.id === blockId ? update(block) : block)),
    }))
  }

  function addBlock(block: PublicationBlock) {
    markAsDraftAfterEdit()

    setContent((current) => ({
      blocks: [...current.blocks, block],
    }))
  }

  function duplicateBlock(blockId: string) {
    markAsDraftAfterEdit()

    setContent((current) => {
      const sourceIndex = current.blocks.findIndex((block) => block.id === blockId)

      if (sourceIndex === -1) {
        return current
      }

      const sourceBlock = current.blocks[sourceIndex]
      const duplicatedBlock = {
        ...cloneBlock(sourceBlock),
        id: createBlockId(),
      }

      const blocks = [...current.blocks]
      blocks.splice(sourceIndex + 1, 0, duplicatedBlock)

      return {
        blocks,
      }
    })
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    markAsDraftAfterEdit()

    setContent((current) => {
      const sourceIndex = current.blocks.findIndex((block) => block.id === blockId)
      const destinationIndex = sourceIndex + direction

      if (sourceIndex === -1 || destinationIndex < 0 || destinationIndex >= current.blocks.length) {
        return current
      }

      const blocks = [...current.blocks]
      const [movedBlock] = blocks.splice(sourceIndex, 1)
      blocks.splice(destinationIndex, 0, movedBlock)

      return {
        blocks,
      }
    })
  }

  function removeBlock(blockId: string) {
    markAsDraftAfterEdit()

    setContent((current) => ({
      blocks: current.blocks.filter((block) => block.id !== blockId),
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!normalizedTitle) {
      setTitleError('Enter a title for your publication.')
      return
    }

    setTitleError(undefined)

    onSave({
      title: normalizedTitle,
      description: normalizedDescription || undefined,
      status,
      content: normalizeContent(content),
    })
  }

  function requestExit() {
    if (hasUnsavedChanges) {
      setIsConfirmingExit(true)
      return
    }

    onBack()
  }

  return (
    <>
      <main className={styles.page}>
        <Container size="lg">
          <Stack gap="xl">
            <PageHeader
              eyebrow="Publication editor"
              title={publication.title}
              description={
                recoveredDraft
                  ? `Status: ${status === 'published' ? 'Published' : 'Draft'} · Recovered unsaved changes`
                  : `Status: ${status === 'published' ? 'Published' : 'Draft'}`
              }
              actions={
                <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={requestExit}>
                  Back to publications
                </Button>
              }
            />

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="lg">
                <Card as="section" padding="lg" aria-labelledby="publication-details-title">
                  <Stack gap="lg">
                    <Stack gap="xs">
                      <Text as="h2" id="publication-details-title" variant="h2" weight="semibold">
                        Publication details
                      </Text>

                      <Text tone="secondary">
                        Refine the working details and release status for this publication.
                      </Text>
                    </Stack>

                    <Field
                      label="Title"
                      required
                      error={titleError}
                      description="This title appears in your publications library."
                    >
                      <Input
                        autoFocus
                        fullWidth
                        value={title}
                        onChange={(event) => {
                          setTitle(event.target.value)
                          markAsDraftAfterEdit()

                          if (titleError) {
                            setTitleError(undefined)
                          }
                        }}
                      />
                    </Field>

                    <Field
                      label="Description"
                      description="Summarize the purpose of this publication."
                    >
                      <Textarea
                        fullWidth
                        rows={6}
                        value={description}
                        onChange={(event) => {
                          setDescription(event.target.value)
                          markAsDraftAfterEdit()
                        }}
                      />
                    </Field>

                    <Field
                      label="Status"
                      description="Drafts remain works in progress. Published items are marked as ready for release."
                    >
                      <Select
                        fullWidth
                        value={status}
                        onChange={(event) => setStatus(event.target.value as PublicationStatus)}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </Select>
                    </Field>
                  </Stack>
                </Card>

                <Card as="section" padding="lg" aria-labelledby="publication-content-title">
                  <Stack gap="lg">
                    <div className={styles.contentHeader}>
                      <Stack gap="xs">
                        <Text as="h2" id="publication-content-title" variant="h2" weight="semibold">
                          Publication content
                        </Text>

                        <Text tone="secondary">
                          Refine compiled content only when an exception needs correction.
                        </Text>
                      </Stack>

                      <Cluster gap="sm">
                        <Button
                          type="button"
                          variant="secondary"
                          startIcon={<Plus size={18} />}
                          onClick={() => addBlock(createHeadingBlock())}
                        >
                          Add heading
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          startIcon={<Plus size={18} />}
                          onClick={() => addBlock(createParagraphBlock())}
                        >
                          Add paragraph
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          startIcon={<Plus size={18} />}
                          onClick={() => addBlock(createMultilineTextFieldBlock())}
                        >
                          Add response field
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          startIcon={<Plus size={18} />}
                          onClick={() => addBlock(createCheckboxFieldBlock())}
                        >
                          Add checkbox
                        </Button>
                      </Cluster>
                    </div>

                    {content.blocks.length === 0 ? (
                      <div className={styles.emptyContent}>
                        <Stack gap="xs">
                          <Text weight="semibold">No content blocks yet</Text>
                          <Text tone="secondary">
                            Add text or a reader response field to begin shaping this publication.
                          </Text>
                        </Stack>
                      </div>
                    ) : (
                      <ol className={styles.blockList} aria-label="Publication content blocks">
                        {content.blocks.map((block, index) => {
                          const blockNumber = index + 1
                          const blockLabel = `Block ${blockNumber} · ${getBlockTypeLabel(block)}`

                          return (
                            <li key={block.id} className={styles.blockItem}>
                              <Stack gap="md">
                                <div className={styles.blockHeader}>
                                  <Text weight="semibold">{blockLabel}</Text>

                                  <Cluster gap="xs" className={styles.blockActions}>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      startIcon={<ArrowUp size={16} />}
                                      disabled={index === 0}
                                      onClick={() => moveBlock(block.id, -1)}
                                    >
                                      Move block {blockNumber} up
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      startIcon={<ArrowDown size={16} />}
                                      disabled={index === content.blocks.length - 1}
                                      onClick={() => moveBlock(block.id, 1)}
                                    >
                                      Move block {blockNumber} down
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      startIcon={<Copy size={16} />}
                                      onClick={() => duplicateBlock(block.id)}
                                    >
                                      Duplicate block {blockNumber}
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      startIcon={<Trash2 size={16} />}
                                      onClick={() => removeBlock(block.id)}
                                    >
                                      Remove block {blockNumber}
                                    </Button>
                                  </Cluster>
                                </div>

                                {block.type === 'heading' ? (
                                  <div className={styles.headingFields}>
                                    <Field label={`Block ${blockNumber} heading level`}>
                                      <Select
                                        fullWidth
                                        value={String(block.level)}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) =>
                                            currentBlock.type === 'heading'
                                              ? {
                                                  ...currentBlock,
                                                  level: Number(
                                                    event.target.value,
                                                  ) as PublicationHeadingLevel,
                                                }
                                              : currentBlock,
                                          )
                                        }
                                      >
                                        <option value="1">Heading 1</option>
                                        <option value="2">Heading 2</option>
                                        <option value="3">Heading 3</option>
                                      </Select>
                                    </Field>

                                    <Field label={`Block ${blockNumber} heading text`}>
                                      <Input
                                        fullWidth
                                        value={block.text}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) => ({
                                            ...currentBlock,
                                            text: event.target.value,
                                          }))
                                        }
                                      />
                                    </Field>
                                  </div>
                                ) : block.type === 'paragraph' ? (
                                  <Field label={`Block ${blockNumber} paragraph text`}>
                                    <Textarea
                                      fullWidth
                                      rows={5}
                                      value={block.text}
                                      onChange={(event) =>
                                        updateBlock(block.id, (currentBlock) => ({
                                          ...currentBlock,
                                          text: event.target.value,
                                        }))
                                      }
                                    />
                                  </Field>
                                ) : block.type === 'multiline-text-field' ? (
                                  <div className={styles.headingFields}>
                                    <Field
                                      label={`Block ${blockNumber} response prompt`}
                                      description="Readers will receive a multiline response area beneath this prompt."
                                    >
                                      <Textarea
                                        fullWidth
                                        rows={3}
                                        value={block.text}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) => ({
                                            ...currentBlock,
                                            text: event.target.value,
                                          }))
                                        }
                                      />
                                    </Field>

                                    <Field
                                      label={`Block ${blockNumber} response size`}
                                      description="Sets the minimum writing space. Auto layout can expand it when room is available."
                                    >
                                      <Select
                                        fullWidth
                                        value={block.responseSize ?? 'long'}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) =>
                                            currentBlock.type === 'multiline-text-field'
                                              ? {
                                                  ...currentBlock,
                                                  responseSize: event.target
                                                    .value as PublicationResponseSizeIntent,
                                                }
                                              : currentBlock,
                                          )
                                        }
                                      >
                                        <option value="short">Short</option>
                                        <option value="medium">Medium</option>
                                        <option value="long">Long</option>
                                      </Select>
                                    </Field>
                                  </div>
                                ) : block.type === 'checkbox-field' ? (
                                  <Field
                                    label={`Block ${blockNumber} checkbox label`}
                                    description="Readers will receive an empty checkbox beside this label."
                                  >
                                    <Input
                                      fullWidth
                                      value={block.text}
                                      onChange={(event) =>
                                        updateBlock(block.id, (currentBlock) => ({
                                          ...currentBlock,
                                          text: event.target.value,
                                        }))
                                      }
                                    />
                                  </Field>
                                ) : block.type === 'rating-field' ? (
                                  <div className={styles.headingFields}>
                                    <Field label={`Block ${blockNumber} rating prompt`}>
                                      <Input
                                        fullWidth
                                        value={block.text}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) => ({
                                            ...currentBlock,
                                            text: event.target.value,
                                          }))
                                        }
                                      />
                                    </Field>

                                    <Field
                                      label={`Block ${blockNumber} rating minimum`}
                                      description="Use a compact bounded scale, such as 0–10."
                                    >
                                      <Input
                                        fullWidth
                                        type="number"
                                        value={String(block.min)}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) =>
                                            currentBlock.type === 'rating-field'
                                              ? {
                                                  ...currentBlock,
                                                  min: Number(event.target.value),
                                                }
                                              : currentBlock,
                                          )
                                        }
                                      />
                                    </Field>

                                    <Field label={`Block ${blockNumber} rating maximum`}>
                                      <Input
                                        fullWidth
                                        type="number"
                                        value={String(block.max)}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) =>
                                            currentBlock.type === 'rating-field'
                                              ? {
                                                  ...currentBlock,
                                                  max: Number(event.target.value),
                                                }
                                              : currentBlock,
                                          )
                                        }
                                      />
                                    </Field>
                                  </div>
                                ) : (
                                  <div className={styles.headingFields}>
                                    <Field
                                      label={`Block ${blockNumber} table title`}
                                      description="Optional caption shown above the worksheet."
                                    >
                                      <Input
                                        fullWidth
                                        value={block.text}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) => ({
                                            ...currentBlock,
                                            text: event.target.value,
                                          }))
                                        }
                                      />
                                    </Field>

                                    <Field
                                      label={`Block ${blockNumber} table columns`}
                                      description="One column heading per line."
                                    >
                                      <Textarea
                                        fullWidth
                                        rows={Math.max(3, block.columns.length)}
                                        value={block.columns.join('\n')}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) => {
                                            if (currentBlock.type !== 'table') {
                                              return currentBlock
                                            }

                                            const columns = parseTableColumns(event.target.value)
                                            const safeColumns = columns.length > 0 ? columns : ['Column']

                                            return {
                                              ...currentBlock,
                                              columns: safeColumns,
                                              rows: currentBlock.rows.map((row) =>
                                                Array.from(
                                                  { length: safeColumns.length },
                                                  (_, columnIndex) => row[columnIndex] ?? '',
                                                ),
                                              ),
                                            }
                                          })
                                        }
                                      />
                                    </Field>

                                    <Field
                                      label={`Block ${blockNumber} table rows`}
                                      description="One row per line. Separate cells with the Tab key."
                                    >
                                      <Textarea
                                        fullWidth
                                        rows={Math.max(4, block.rows.length + 1)}
                                        value={serializeTableRows(block.rows)}
                                        onChange={(event) =>
                                          updateBlock(block.id, (currentBlock) =>
                                            currentBlock.type === 'table'
                                              ? {
                                                  ...currentBlock,
                                                  rows: parseTableRows(
                                                    event.target.value,
                                                    currentBlock.columns.length,
                                                  ),
                                                }
                                              : currentBlock,
                                          )
                                        }
                                      />
                                    </Field>
                                  </div>
                                )}

                                <Field
                                  label={`Block ${blockNumber} page placement`}
                                  description="Leave this on Auto unless the compiled layout needs a gentle correction."
                                >
                                  <Select
                                    fullWidth
                                    value={getPagePlacementValue(block)}
                                    onChange={(event) =>
                                      updateBlock(block.id, (currentBlock) =>
                                        withPagePlacement(
                                          currentBlock,
                                          event.target.value as PagePlacementValue,
                                        ),
                                      )
                                    }
                                  >
                                    <option value="auto">Auto</option>
                                    <option value="preferred">Prefer new page</option>
                                    <option value="forced">Start new page</option>
                                  </Select>
                                </Field>
                                {getPagePlacementValue(block) !== 'auto' ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      updateBlock(block.id, (currentBlock) =>
                                        withPagePlacement(currentBlock, 'auto'),
                                      )
                                    }
                                  >
                                    Reset to Auto
                                  </Button>
                                ) : null}
                              </Stack>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                  </Stack>
                </Card>

                <Cluster justify="end" gap="sm">
                  <Button type="button" variant="ghost" onClick={requestExit}>
                    Cancel
                  </Button>

                  <Button type="submit" startIcon={<Save size={18} />}>
                    Save changes
                  </Button>
                </Cluster>
              </Stack>
            </form>
          </Stack>
        </Container>
      </main>

      {isConfirmingExit ? (
        <UnsavedChangesConfirmation
          onKeepEditing={() => setIsConfirmingExit(false)}
          onDiscard={() => {
            onDraftDiscard?.()
            onBack()
          }}
        />
      ) : null}
    </>
  )
}
