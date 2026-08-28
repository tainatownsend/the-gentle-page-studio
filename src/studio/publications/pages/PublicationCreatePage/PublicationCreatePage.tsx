import { useState, type ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Field } from '@/design-system/primitives/Field'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { Textarea } from '@/design-system/primitives/Textarea'

import { PublicationCreateForm, type PublicationCreateValues } from '../../components'
import { compileGentlePageManuscript } from '../../compiler'
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
  const [manuscript, setManuscript] = useState('')
  const [manuscriptError, setManuscriptError] = useState<string>()
  const [showManualCreation, setShowManualCreation] = useState(false)

  function handleCompile() {
    const normalizedManuscript = manuscript.trim()

    if (!normalizedManuscript) {
      setManuscriptError('Paste a manuscript before compiling the publication.')
      return
    }

    const result = compileGentlePageManuscript(normalizedManuscript)

    if (result.content.blocks.length === 0) {
      setManuscriptError('The manuscript needs publication content in addition to its title.')
      return
    }

    setManuscriptError(undefined)

    onCreate({
      title: result.title,
      content: result.content,
      creationMode: 'compiled',
    })
  }

  return (
    <main className={styles.page}>
      <Container size="md">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Create publication"
            description="Paste your manuscript. Gentle Page will interpret the structure and compose the publication for you."
            actions={
              <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                Back to publications
              </Button>
            }
          />

          <Card as="section" padding="lg" aria-labelledby="compiler-title">
            <Stack gap="lg">
              <Stack gap="xs">
                <Text as="h2" id="compiler-title" variant="h2" weight="semibold">
                  Paste. Compile. Preview. Export.
                </Text>
                <Text tone="secondary">
                  Paste content from ChatGPT, Gemini, Claude, Markdown, or any other writing tool. The
                  compiler will create the publication blocks and preserve Gentle Page manuscript
                  directives automatically.
                </Text>
              </Stack>

              <Field
                label="Manuscript"
                required
                error={manuscriptError}
                description="For the most deterministic result, use Markdown headings and Gentle Page directives such as [[GP:RESPONSE]] and [[GP:PAGE_BREAK]]."
              >
                <Textarea
                  autoFocus
                  fullWidth
                  rows={16}
                  value={manuscript}
                  onChange={(event) => {
                    setManuscript(event.target.value)
                    if (manuscriptError) setManuscriptError(undefined)
                  }}
                  placeholder={`# Publication title

## Section title

### Reflection prompt

[[GP:RESPONSE size="long"]]`}
                />
              </Field>

              <div className={styles.compilerNote}>
                <Text weight="semibold">Zero-touch by default</Text>
                <Text tone="secondary">
                  The compiler makes the layout decisions. Manual editing remains available only for
                  exceptions or preference changes.
                </Text>
              </div>

              <Cluster justify="end" gap="sm">
                <Button type="button" onClick={handleCompile}>
                  Compile publication
                </Button>
              </Cluster>
            </Stack>
          </Card>

          <div className={styles.advancedSection}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowManualCreation((current) => !current)}
              aria-expanded={showManualCreation}
            >
              {showManualCreation ? 'Hide manual creation' : 'Advanced: start manually'}
            </Button>
          </div>

          {showManualCreation ? (
            <>
              <Card as="section" padding="lg" aria-labelledby="template-title">
                <Stack gap="md">
                  <Stack gap="xs">
                    <Text as="h2" id="template-title" variant="h2" weight="semibold">
                      Choose a starting point
                    </Text>
                    <Text tone="secondary">
                      Templates are the manual fallback. Everything remains editable afterward.
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
            </>
          ) : null}
        </Stack>
      </Container>
    </main>
  )
}
