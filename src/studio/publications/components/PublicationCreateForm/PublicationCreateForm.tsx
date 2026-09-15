import {
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'

import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Field } from '@/design-system/primitives/Field'
import { Input } from '@/design-system/primitives/Input'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { Textarea } from '@/design-system/primitives/Textarea'

import type { PublicationContent } from '../../types'

import styles from './PublicationCreateForm.module.css'

export type PublicationCreationMode = 'manual' | 'compiled'

export type PublicationCreateValues = {
  title: string
  description?: string
  templateId?: string
  content?: PublicationContent
  creationMode?: PublicationCreationMode
}

export type PublicationCreateFormProps = {
  onSubmit: (values: PublicationCreateValues) => void
  onCancel: () => void
  templateId?: string
}

export function PublicationCreateForm({
  onSubmit,
  onCancel,
  templateId,
}: PublicationCreateFormProps): ReactElement {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

    onSubmit({
      title: normalizedTitle,
      description: normalizedDescription || undefined,
      templateId,
      creationMode: 'manual',
    })
  }

  return (
    <Card as="section" padding="lg" aria-labelledby="create-publication-title">
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text as="h2" id="create-publication-title" variant="h2" weight="semibold">
              Create publication manually
            </Text>
            <Text tone="secondary">
              Use this only when you want to start from a template or build the publication block by block.
            </Text>
          </Stack>

          <Field
            label="Title"
            required
            error={titleError}
            description="Use a clear working title. You can change it later."
          >
            <Input
              fullWidth
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (titleError) setTitleError(undefined)
              }}
              placeholder="e.g. ADHD Emotional Regulation Journal"
            />
          </Field>

          <Field label="Description" description="Add a short note about the purpose of this publication.">
            <Textarea
              fullWidth
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will this publication help readers do?"
            />
          </Field>

          <Cluster justify="end" gap="sm" className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create draft</Button>
          </Cluster>
        </Stack>
      </form>
    </Card>
  )
}
