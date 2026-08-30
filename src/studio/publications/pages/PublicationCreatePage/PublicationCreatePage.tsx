import { useState, type ChangeEvent, type ReactElement } from 'react'
import { ArrowLeft, FileUp } from 'lucide-react'

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
  importDocxManuscript,
  type DocxImportStats,
} from '../../compiler'
import { PUBLICATION_TEMPLATES } from '../../templates'

import styles from './PublicationCreatePage.module.css'

export type PublicationCreatePageProps = {
  onBack: () => void
  onCreate: (values: PublicationCreateValues) => void
}

type ImportedDocxSummary = {
  fileName: string
  stats: DocxImportStats
  suggestions: number
}

function formatDocxSummary(summary: ImportedDocxSummary): string {
  const parts = [
    `${summary.stats.paragraphs} paragraphs`,
    `${summary.stats.tables} tables`,
    `${summary.stats.pageBreakHints} page-break hints`,
  ]

  if (summary.stats.responseAreas > 0) parts.push(`${summary.stats.responseAreas} response areas`)
  if (summary.stats.checkboxItems > 0) parts.push(`${summary.stats.checkboxItems} checkboxes`)

  return parts.join(' · ')
}

export function PublicationCreatePage({
  onBack,
  onCreate,
}: PublicationCreatePageProps): ReactElement {
  const [templateId, setTemplateId] = useState('blank')
  const [manuscript, setManuscript] = useState('')
  const [manuscriptError, setManuscriptError] = useState<string>()
  const [docxError, setDocxError] = useState<string>()
  const [isImportingDocx, setIsImportingDocx] = useState(false)
  const [importedDocx, setImportedDocx] = useState<ImportedDocxSummary>()
  const [showManualCreation, setShowManualCreation] = useState(false)

  function handleCompile() {
    const normalizedManuscript = manuscript.trim()

    if (!normalizedManuscript) {
      setManuscriptError('Paste a manuscript or upload a .docx file before compiling the publication.')
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

  async function handleDocxChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setDocxError(undefined)
    setManuscriptError(undefined)
    setIsImportingDocx(true)

    try {
      const result = await importDocxManuscript(file)
      setManuscript(result.manuscript)
      setImportedDocx({
        fileName: file.name,
        stats: result.stats,
        suggestions: result.diagnostics.filter((diagnostic) => diagnostic.level === 'suggestion')
          .length,
      })
    } catch (error) {
      setImportedDocx(undefined)
      setDocxError(error instanceof Error ? error.message : 'The Word document could not be imported.')
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
            description="Bring your manuscript. Gentle Page will interpret the structure and compose the publication for you."
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
                  Paste content from ChatGPT, Gemini, Claude, Markdown, or upload a Word document. The
                  compiler normalizes everything into the same Gentle Page publication pipeline.
                </Text>
              </Stack>

              <div className={styles.inputChoice}>
                <label className={styles.docxUpload} aria-disabled={isImportingDocx}>
                  <FileUp size={18} aria-hidden="true" />
                  <span>{isImportingDocx ? 'Importing Word document…' : 'Upload .docx'}</span>
                  <input
                    className={styles.srOnly}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={isImportingDocx}
                    onChange={(event) => void handleDocxChange(event)}
                  />
                </label>
                <Text tone="secondary">or paste the manuscript below</Text>
              </div>

              {docxError ? (
                <div className={styles.importError} role="alert">
                  <Text weight="semibold">Word import could not be completed</Text>
                  <Text>{docxError}</Text>
                </div>
              ) : null}

              {importedDocx ? (
                <div className={styles.importSuccess} role="status" aria-live="polite">
                  <Text weight="semibold">Word manuscript imported: {importedDocx.fileName}</Text>
                  <Text tone="secondary">{formatDocxSummary(importedDocx)}</Text>
                  {importedDocx.suggestions > 0 ? (
                    <Text tone="secondary">
                      {importedDocx.suggestions} optional import suggestion
                      {importedDocx.suggestions === 1 ? '' : 's'} detected. Compilation is not blocked.
                    </Text>
                  ) : null}
                </div>
              ) : null}

              <Field
                label="Manuscript"
                required
                error={manuscriptError}
                description="For the most deterministic result, use Markdown headings and Gentle Page directives such as [[GP:RESPONSE]] and [[GP:PAGE_BREAK]]. Word imports are converted into this same manuscript representation automatically."
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
                  Word headings, paragraph order, lists, checkboxes, tables, blank response lines, and
                  page-break hints are interpreted automatically. The compiler makes layout decisions;
                  manual editing remains available only for exceptions or preference changes.
                </Text>
              </div>

              <Cluster justify="end" gap="sm">
                <Button type="button" disabled={isImportingDocx} onClick={handleCompile}>
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
