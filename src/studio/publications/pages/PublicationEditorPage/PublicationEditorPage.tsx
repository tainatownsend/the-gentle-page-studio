import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Copy,
  MessageSquareText,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

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
  PublicationCheckboxFieldBlock,
  PublicationContent,
  PublicationHeadingBlock,
  PublicationHeadingLevel,
  PublicationMultilineTextFieldBlock,
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
  onBack: () => void
  onSave: (values: PublicationEditorValues) => void
}

type UnsavedChangesConfirmationProps = {
  onKeepEditing: () => void
  onDiscard: () => void
}

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

function createMultilineTextFieldBlock(): PublicationMultilineTextFieldBlock {
  return {
    id: createBlockId(),
    type: 'multiline-text-field',
    text: '',
  }
}

function createCheckboxFieldBlock(): PublicationCheckboxFieldBlock {
  return {
    id: createBlockId(),
    type: 'checkbox-field',
    text: '',
  }
}

function cloneContent(content: PublicationContent): PublicationContent {
  return {
    blocks: content.blocks.map((block) => ({
      ...block,
    })),
  }
}

function normalizeContent(content: PublicationContent): PublicationContent {
  return {
    blocks: content.blocks.map((block) => ({
      ...block,
      text: block.text.trim(),
    })),
  }
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
      currentBlock.text.trim() !== savedBlock.text.trim()
    ) {
      return false
    }

    if (currentBlock.type === 'heading' && savedBlock.type === 'heading') {
      return currentBlock.level === savedBlock.level
    }

    return true
  })
}

function getBlockTypeLabel(block: PublicationBlock): string {
  switch (block.type) {
    case 'heading':
      return 'Heading'
    case 'paragraph':
      return 'Paragraph'
    case 'multiline-text-field':
      return 'Response field'
    case 'checkbox-field':
      return 'Checkbox'
  }
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
  onBack,
  onSave,
}: PublicationEditorPageProps): ReactElement {
  const [title, setTitle] = useState(publication.title)
  const [description, setDescription] = useState(publication.description ?? '')
  const [status, setStatus] = useState<PublicationStatus>(publication.status)
  const [content, setContent] = useState<PublicationContent>(() =>
    cloneContent(publication.content),
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
        ...sourceBlock,
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
              description={`Status: ${status === 'published' ? 'Published' : 'Draft'}`}
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
                          Build the publication with editorial content and response fields.
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
                          startIcon={<MessageSquareText size={18} />}
                          onClick={() => addBlock(createMultilineTextFieldBlock())}
                        >
                          Add response field
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          startIcon={<CheckSquare size={18} />}
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
                            Add editorial content or a response field to begin shaping this publication.
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
                                  <Field
                                    label={`Block ${blockNumber} response prompt`}
                                    description="This prompt appears above a multiline response area in the publication."
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
                                ) : (
                                  <Field
                                    label={`Block ${blockNumber} checkbox label`}
                                    description="This label appears beside an empty checkbox in the publication."
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
                                )}
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
          onDiscard={onBack}
        />
      ) : null}
    </>
  )
}
