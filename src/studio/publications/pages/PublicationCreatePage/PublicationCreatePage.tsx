import type { ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'

import { PublicationCreateForm, type PublicationCreateValues } from '../../components'

import styles from './PublicationCreatePage.module.css'

export type PublicationCreatePageProps = {
  onBack: () => void
  onCreate: (values: PublicationCreateValues) => void
}

export function PublicationCreatePage({
  onBack,
  onCreate,
}: PublicationCreatePageProps): ReactElement {
  return (
    <main className={styles.page}>
      <Container size="md">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Create publication"
            description="Start with the essentials, then continue shaping the publication in the editor."
            actions={
              <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                Back to publications
              </Button>
            }
          />

          <PublicationCreateForm onSubmit={onCreate} onCancel={onBack} />
        </Stack>
      </Container>
    </main>
  )
}
