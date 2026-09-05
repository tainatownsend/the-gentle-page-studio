import { useState, type ChangeEvent, type ReactElement } from 'react'
import { ArrowLeft, Copy, FileUp } from 'lucide-react'

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
import {
  compileGentlePageManuscript,
  GENTLE_PAGE_AI_AUTHORING_PROMPT,
  importDocxManuscript,
} from '../../compiler'
import { PUBLICATION_TEMPLATES } from '../../templates'

import styles from './PublicationCreatePage.module.css'

export type PublicationCreatePageProps = {
  onBack: () => void
  onCreate: (values: PublicationCreateValues) => void
}

type AiPromptCopyStatus = 'idle' | 'copied' | 'error'

export function PublicationCreatePage({
  onBack,
  onCreate,
}: PublicationCreatePageProps): ReactElement {
  const [templateId, setTemplateId] = useState('blank')
  const [manuscript, setManuscript] = useState('')
  const [manuscriptError, setManuscriptError] = useState<string>()
  const [isImportingDocx, setIsImportingDocx] = useState(false)
  const [importDiagnostics, setImportDiagnostics] = useState<string[]>([])
  const [showManualCreation, setShowManualCreation] = useState(false)
  const [aiPromptCopyStatus, setAiPromptCopyStatus] = useState<AiPromptCopyStatus>('idle')

  function createFromManuscript(source: string) {
    const normalizedManuscript = source.trim()

    if (!normalizedManuscript) {
      setManuscriptError('Paste a manuscript before compiling the publication.')
      return false
    }

    const result = compileGentlePageManuscript(normalizedManuscript)

    if (result.content.blocks.length === 0) {
      setManuscriptError('The manuscript needs publication content in addition to its title.')
      return false
    }

    setManuscriptError(undefined)

    onCreate({
      title: result.title,
      content: result.content,
      creationMode: 'compiled',
    })

    return true
  }

  function handleCompile() {
    createFromManuscript(manuscript)
  }

  async function handleCopyAiPrompt() {
    try {
      if (!globalThis.navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }

      await globalThis.navigator.clipboard.writeText(GENTLE_PAGE_AI_AUTHORING_PROMPT)
      setAiPromptCopyStatus('copied')
    } catch {
      setAiPromptCopyStatus('error')
    }
  }

  async function handleDocxUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setManuscriptError('Choose a Microsoft Word .docx file.')
      return
    }

    setIsImportingDocx(true)
    setManuscriptError(undefined)
    setImportDiagnostics([])

    try {
      const imported = await importDocxManuscript(await file.arrayBuffer(), file.name)
      const diagnosticMessages = imported.diagnostics.map((diagnostic) => diagnostic.message)

      setManuscript(imported.manuscript)

      // DOCX diagnostics are advisory. A readable manuscript should always continue through
      // the compiler so that users land in Preview without an unnecessary review gate.
      // Only surface the diagnostics if the compiled manuscript itself cannot be created.
      if (!createFromManuscript(imported.manuscript)) {
        setImportDiagnostics(diagnosticMessages)
      }
    } catch (error) {
      setManuscriptError(
        error instanceof Error
          ? error.message
          : 'The DOCX file could not be imported. Your existing publications are unchanged.',
      )
    } finally {
      setIsImportingDocx(false)
    }
  }

  return (
    <main className={styles.page}>
      <Container size="md">
        <Stack gap="xl">
          <PageHeader
            eyebrow="The Gentle Page Studio"
            title="Create publication"
            description="Bring the manuscript. Gentle Page interprets the structure, composes the pages, and prepares the publication for you."
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
                  Paste content from ChatGPT, Gemini, Claude, or another writing tool — or upload a
                  Word document. The compiler handles the publication structure and layout.
                </Text>
              </Stack>

              <div className={styles.aiPromptHandoff}>
                <Stack gap="xs">
                  <Text weight="semibold">Generating the journal with AI first?</Text>
                  <Text tone="secondary">
                    Copy the Gentle Page authoring instructions into ChatGPT, Gemini, Claude, or any
                    other AI so it returns a manuscript the compiler can interpret with minimal guesswork.
                  </Text>
                </Stack>

                <Button
                  type="button"
                  variant="secondary"
                  startIcon={<Copy size={18} />}
                  onClick={() => void handleCopyAiPrompt()}
                >
                  {aiPromptCopyStatus === 'copied' ? 'AI prompt copied' : 'Copy AI authoring prompt'}
                </Button>

                {aiPromptCopyStatus === 'copied' ? (
                  <Text tone="secondary" role="status">
                    Paste it into your AI conversation, ask for the journal you want, then bring the
                    generated manuscript back here.
                  </Text>
                ) : null}

                {aiPromptCopyStatus === 'error' ? (
                  <Text tone="secondary" role="alert">
                    The browser could not copy the prompt. The DOCX and pasted-manuscript paths remain
                    available.
                  </Text>
                ) : null}
              </div>

              <div className={styles.inputChoices}>
                <label className={styles.docxUpload} aria-busy={isImportingDocx}>
                  <FileUp size={20} aria-hidden="true" />
                  <span>
                    <strong>{isImportingDocx ? 'Importing Word document…' : 'Upload .docx'}</strong>
                    <small>Import and compile directly to preview</small>
                  </span>
                  <input
                    className={styles.srOnly}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={isImportingDocx}
                    onChange={(event) => void handleDocxUpload(event)}
                  />
                </label>

                <div className={styles.orDivider} aria-hidden="true">
                  <span>or paste</span>
                </div>
              </div>

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

              {importDiagnostics.length > 0 ? (
                <div className={styles.importReview} role="status">
                  <Text weight="semibold">Import details</Text>
                  <Text tone="secondary">
                    Gentle Page could not finish this manuscript automatically. These notes may help
                    identify the content that needs attention before compiling again.
                  </Text>
                  <ul>
                    {importDiagnostics.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={styles.compilerNote}>
                <Text weight="semibold">Zero-touch by default</Text>
                <Text tone="secondary">
                  Word headings, page-break hints, checkboxes, writing lines, paragraphs, and tables
                  are interpreted locally in your browser. Advisory import notes never interrupt a
                  valid compilation; manual editing remains an exception path.
                </Text>
              </div>

              <Cluster justify="end" gap="sm">
                <Button type="button" onClick={handleCompile} disabled={isImportingDocx}>
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
