import {
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { ArrowLeft, Save } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Field } from '@/design-system/primitives/Field'
import { Input } from '@/design-system/primitives/Input'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { Textarea } from '@/design-system/primitives/Textarea'
import type { Publication } from '../../components/PublicationCard'

import styles from './PublicationEditorPage.module.css'

export type PublicationEditorValues = {
  title: string
  description?: string
}

export type PublicationEditorPageProps = {
  publication: Publication
  onBack: () => void
  onSave: (values: PublicationEditorValues) => void
}

export function PublicationEditorPage({
  publication,
  onBack,
  onSave,
}: PublicationEditorPageProps): ReactElement {
  const [title, setTitle] = useState(publication.title)
  const [description, setDescription] = useState(
    publication.description ?? '',
  )
  const [titleError, setTitleError] = useState<string>()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()

    if (!normalizedTitle) {
      setTitleError('Enter a title for your publication.')
      return
    }

    setTitleError(undefined)

    onSave({
      title: normalizedTitle,
      description: normalizedDescription || undefined,
    })
  }

  return (
    <main className={styles.page}>
      <Container size="lg">
        <Stack gap="xl">
          <PageHeader
            eyebrow="Publication editor"
            title={publication.title}
            description={`Status: ${
              publication.status === 'published'
                ? 'Published'
                : 'Draft'
            }`}
            actions={
              <Button
                variant="ghost"
                startIcon={<ArrowLeft size={18} />}
                onClick={onBack}
              >
                Back to publications
              </Button>
            }
          />

          <Card as="section" padding="lg" aria-labelledby="publication-details-title">
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="lg">
                <Stack gap="xs">
                  <Text
                    as="h2"
                    id="publication-details-title"
                    variant="h2"
                    weight="semibold"
                  >
                    Publication details
                  </Text>

                  <Text tone="secondary">
                    Refine the working title and description for this draft.
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
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                  />
                </Field>

                <Cluster justify="end" gap="sm">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    startIcon={<Save size={18} />}
                  >
                    Save changes
                  </Button>
                </Cluster>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </main>
  )
}
