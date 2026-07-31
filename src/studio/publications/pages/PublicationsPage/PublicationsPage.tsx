import { useEffect, useRef, useState, type ReactElement } from 'react'
import { BookOpen, Plus } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { ResourceCollection } from '@/studio/resources'

import {
  PublicationCard,
  PublicationCreateForm,
  type PublicationCreateValues,
} from '../../components'
import type { Publication } from '../../types'

import styles from './PublicationsPage.module.css'

export type PublicationsPageProps = {
  publications: readonly Publication[]
  isCreating?: boolean
  onCreate?: () => void
  onCancelCreate?: () => void
  onSubmitCreate?: (values: PublicationCreateValues) => void
  onOpen?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
}

type DeleteConfirmationProps = {
  publication: Publication
  onCancel: () => void
  onConfirm: () => void
}

function DeleteConfirmation({
  publication,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps): ReactElement {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div className={styles.dialogBackdrop}>
      <section
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-publication-title"
        aria-describedby="delete-publication-description"
      >
        <Stack gap="md">
          <Stack gap="sm">
            <Text as="h2" id="delete-publication-title" variant="h2" weight="semibold">
              Delete publication?
            </Text>

            <Text id="delete-publication-description" tone="secondary">
              “{publication.title}” will be permanently removed. This action cannot be undone.
            </Text>
          </Stack>

          <div className={styles.dialogActions}>
            <Button ref={cancelButtonRef} variant="secondary" onClick={onCancel}>
              Cancel
            </Button>

            <Button onClick={onConfirm}>Delete publication</Button>
          </div>
        </Stack>
      </section>
    </div>
  )
}

export function PublicationsPage({
  publications,
  isCreating = false,
  onCreate,
  onCancelCreate,
  onSubmitCreate,
  onOpen,
  onDuplicate,
  onDelete,
}: PublicationsPageProps): ReactElement {
  const [pendingDeletionId, setPendingDeletionId] = useState<string>()

  const hasPublications = publications.length > 0
  const canRenderCreateForm = isCreating && onCancelCreate && onSubmitCreate

  const pendingDeletion = publications.find((publication) => publication.id === pendingDeletionId)

  function handleConfirmDelete() {
    if (!pendingDeletion) {
      return
    }

    onDelete?.(pendingDeletion.id)
    setPendingDeletionId(undefined)
  }

  return (
    <>
      <main className={styles.page}>
        <Container size="lg">
          <Stack gap="xl">
            <PageHeader
              eyebrow="The Gentle Page Studio"
              title="Publications"
              description="Create, organize, and prepare thoughtful digital products for release."
              actions={
                hasPublications && !isCreating && onCreate ? (
                  <Button startIcon={<Plus size={18} />} onClick={onCreate}>
                    Create publication
                  </Button>
                ) : null
              }
            />

            {canRenderCreateForm ? (
              <PublicationCreateForm onSubmit={onSubmitCreate} onCancel={onCancelCreate} />
            ) : null}

            {hasPublications || !isCreating ? (
              <ResourceCollection
                aria-label="Publications"
                resources={publications}
                getResourceKey={(publication) => publication.id}
                renderResource={(publication) => (
                  <PublicationCard
                    publication={publication}
                    onOpen={onOpen}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete ? setPendingDeletionId : undefined}
                  />
                )}
                emptyIcon={<BookOpen size={28} />}
                emptyTitle="Create your first publication"
                emptyDescription="Start with one thoughtful idea. You can shape the content, design, and release details as you go."
                emptyActions={
                  onCreate ? (
                    <Button startIcon={<Plus size={18} />} onClick={onCreate}>
                      Create publication
                    </Button>
                  ) : null
                }
              />
            ) : null}
          </Stack>
        </Container>
      </main>

      {pendingDeletion ? (
        <DeleteConfirmation
          publication={pendingDeletion}
          onCancel={() => setPendingDeletionId(undefined)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  )
}
