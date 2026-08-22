import { useState, type ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'

import { PublicationCreateForm, type PublicationCreateValues } from '../../components'
import { PUBLICATION_TEMPLATES } from '../../templates'

import styles from './PublicationCreatePage.module.css'

export type PublicationCreatePageProps = {
  onBack: () => void
  onCreate: (values: PublicationCreateValues) => void
}

export function PublicationCreatePage({
  onBack,
  onCreate,
}: PublicationCreatePageProps): ReactElement {
  const [templateId, setTemplateId] = useState('blank')

  return (
    <main className={styles.page}>
      <Container size="md">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Create publication"
            description="Start from a Gentle Page template or begin with a blank publication."
            actions={
              <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                Back to publications
              </Button>
            }
          />

          <Card as="section" padding="lg" aria-labelledby="template-title">
            <Stack gap="md">
              <Stack gap="xs">
                <Text as="h2" id="template-title" variant="h2" weight="semibold">
                  Choose a starting point
                </Text>
                <Text tone="secondary">
                  Templates only provide initial blocks. Everything remains editable afterward.
                </Text>
              </Stack>

              <fieldset className={styles.templateGrid}>
                <legend className={styles.srOnly}>Publication template</legend>
                {PUBLICATION_TEMPLATES.map((template) => (
                  <label key={template.id} className={styles.templateOption}>
                    <input
                      type="radio"
                      name="publication-template"
                      value={template.id}
                      checked={templateId === template.id}
                      onChange={() => setTemplateId(template.id)}
                    />
                    <span>
                      <strong>{template.name}</strong>
                      <span>{template.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </Stack>
          </Card>

          <PublicationCreateForm onSubmit={onCreate} onCancel={onBack} templateId={templateId} />
        </Stack>
      </Container>
    </main>
  )
}
