import { useState, type ReactElement } from 'react'
import { ArrowLeft, GitCompareArrows, RotateCcw } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'

import type { Publication, PublicationRevision } from '../../types'
import {
  comparePublicationRevisions,
  type PublicationRevisionChange,
} from '../../utils'

import styles from './PublicationHistoryPage.module.css'

export type PublicationHistoryPageProps = {
  publication: Publication
  revisions: readonly PublicationRevision[]
  onBack: () => void
  onRestore: (revisionId: string) => void
}

type SelectedComparison = {
  older: PublicationRevision
  newer: PublicationRevision
}

function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function describeChange(change: PublicationRevisionChange): string {
  if (change.kind === 'metadata') {
    return `${change.field === 'title' ? 'Title' : 'Description'} changed`
  }

  if (change.kind === 'block-added') {
    return `Added ${change.after.type.replaceAll('-', ' ')}`
  }

  if (change.kind === 'block-removed') {
    return `Removed ${change.before.type.replaceAll('-', ' ')}`
  }

  if (change.kind === 'block-changed') {
    return `Changed ${change.after.type.replaceAll('-', ' ')}`
  }

  return `Moved block from position ${change.beforeIndex + 1} to ${change.afterIndex + 1}`
}

export function PublicationHistoryPage({
  publication,
  revisions,
  onBack,
  onRestore,
}: PublicationHistoryPageProps): ReactElement {
  const [selectedComparison, setSelectedComparison] =
    useState<SelectedComparison>()

  const comparison = selectedComparison
    ? comparePublicationRevisions(
        selectedComparison.older,
        selectedComparison.newer,
      )
    : undefined

  return (
    <main className={styles.page}>
      <Container size="md">
        <Stack gap="xl">
          <PageHeader
            eyebrow="Publication history"
            title={publication.title}
            description="Published versions are preserved as read-only snapshots. Restoring one creates a new draft."
            actions={
              <Button
                variant="ghost"
                startIcon={<ArrowLeft size={18} />}
                onClick={onBack}
              >
                Back to preview
              </Button>
            }
          />

          {revisions.length === 0 ? (
            <Card
              as="section"
              padding="lg"
              className={styles.emptyState}
            >
              <Stack gap="xs">
                <Text weight="semibold">No published versions yet</Text>
                <Text tone="secondary">
                  A version will appear here the next time this publication is
                  explicitly published.
                </Text>
              </Stack>
            </Card>
          ) : (
            <ol
              className={styles.revisionList}
              aria-label="Published versions"
            >
              {revisions.map((revision, index) => {
                const previousRevision = revisions[index + 1]

                return (
                  <li key={revision.id}>
                    <Card as="article" padding="lg">
                      <Stack gap="md">
                        <Stack gap="xs">
                          <Text as="h2" variant="h3" weight="semibold">
                            Version {revisions.length - index}
                          </Text>
                          <Text>{revision.title}</Text>
                          <Text tone="secondary">
                            Published{' '}
                            <time dateTime={revision.publishedAt}>
                              {formatPublishedAt(revision.publishedAt)}
                            </time>
                          </Text>
                        </Stack>

                        <div className={styles.actions}>
                          {previousRevision ? (
                            <Button
                              variant="ghost"
                              startIcon={<GitCompareArrows size={18} />}
                              onClick={() =>
                                setSelectedComparison({
                                  older: previousRevision,
                                  newer: revision,
                                })
                              }
                            >
                              Compare with previous
                            </Button>
                          ) : null}

                          <Button
                            variant="secondary"
                            startIcon={<RotateCcw size={18} />}
                            onClick={() => onRestore(revision.id)}
                          >
                            Restore as new draft
                          </Button>
                        </div>
                      </Stack>
                    </Card>
                  </li>
                )
              })}
            </ol>
          )}

          {comparison && selectedComparison ? (
            <Card as="section" padding="lg" aria-labelledby="revision-comparison-title">
              <Stack gap="md">
                <Stack gap="xs">
                  <Text
                    as="h2"
                    id="revision-comparison-title"
                    variant="h3"
                    weight="semibold"
                  >
                    Version comparison
                  </Text>
                  <Text tone="secondary">
                    Comparing the version published{' '}
                    {formatPublishedAt(selectedComparison.older.publishedAt)} with{' '}
                    {formatPublishedAt(selectedComparison.newer.publishedAt)}.
                  </Text>
                </Stack>

                {comparison.hasChanges ? (
                  <ul className={styles.changeList} aria-label="Revision changes">
                    {comparison.changes.map((change, index) => (
                      <li key={`${change.kind}-${index}`}>
                        <Text>{describeChange(change)}</Text>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text>No differences found between these versions.</Text>
                )}
              </Stack>
            </Card>
          ) : null}
        </Stack>
      </Container>
    </main>
  )
}
