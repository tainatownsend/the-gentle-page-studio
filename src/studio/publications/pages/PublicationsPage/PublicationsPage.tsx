import type { ReactElement } from 'react'
import { BookOpen, Plus } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { ResourceCollection } from '@/studio/resources'
import {
  PublicationCard,
  type Publication,
} from '../../components/PublicationCard'

import styles from './PublicationsPage.module.css'

export type PublicationsPageProps = {
  publications: readonly Publication[]
  onCreate?: () => void
  onOpen?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
}

export function PublicationsPage({
  publications,
  onCreate,
  onOpen,
  onDuplicate,
  onDelete,
}: PublicationsPageProps): ReactElement {
  const hasPublications = publications.length > 0

  return (
    <main className={styles.page}>
      <Container size="lg">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Publications"
            description="Create, organize, and prepare thoughtful digital products for release."
            actions={
              hasPublications && onCreate ? (
                <Button
                  startIcon={<Plus size={18} />}
                  onClick={onCreate}
                >
                  Create publication
                </Button>
              ) : null
            }
          />

          <ResourceCollection
            aria-label="Publications"
            resources={publications}
            getResourceKey={(publication) => publication.id}
            renderResource={(publication) => (
              <PublicationCard
                publication={publication}
                onOpen={onOpen}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            )}
            emptyIcon={<BookOpen size={28} />}
            emptyTitle="Create your first publication"
            emptyDescription="Start with one thoughtful idea. You can shape the content, design, and release details as you go."
            emptyActions={
              onCreate ? (
                <Button
                  startIcon={<Plus size={18} />}
                  onClick={onCreate}
                >
                  Create publication
                </Button>
              ) : null
            }
          />
        </Stack>
      </Container>
    </main>
  )
}
