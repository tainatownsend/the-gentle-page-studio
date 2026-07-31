import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import { ArrowLeft, Save } from 'lucide-react'

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

import type { Publication, PublicationStatus } from '../../types'

import styles from './PublicationEditorPage.module.css'

export type PublicationEditorValues = {
  title: string
  description?: string
  status: PublicationStatus
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
  const [titleError, setTitleError] = useState<string>()
  const [isConfirmingExit, setIsConfirmingExit] = useState(false)

  const normalizedTitle = title.trim()
  const normalizedDescription = description.trim()
  const savedDescription = publication.description ?? ''

  const hasUnsavedChanges =
    normalizedTitle !== publication.title ||
    normalizedDescription !== savedDescription ||
    status !== publication.status

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
              description={`Status: ${publication.status === 'published' ? 'Published' : 'Draft'}`}
              actions={
                <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={requestExit}>
                  Back to publications
                </Button>
              }
            />

            <Card as="section" padding="lg" aria-labelledby="publication-details-title">
              <form onSubmit={handleSubmit} noValidate>
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
                      onChange={(event) => setDescription(event.target.value)}
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
            </Card>
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
