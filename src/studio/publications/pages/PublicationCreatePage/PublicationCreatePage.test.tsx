import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import { importDocxManuscript } from '../../compiler'
import { PublicationCreatePage } from './PublicationCreatePage'

vi.mock('../../compiler', async () => {
  const actual = await vi.importActual<typeof import('../../compiler')>('../../compiler')

  return {
    ...actual,
    importDocxManuscript: vi.fn(),
  }
})

const mockedImportDocxManuscript = vi.mocked(importDocxManuscript)

afterEach(() => {
  mockedImportDocxManuscript.mockReset()
})

describe('PublicationCreatePage', () => {
  it('renders the compiler as the primary creation experience', () => {
    render(<PublicationCreatePage onBack={() => undefined} onCreate={() => undefined} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Create publication',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /manuscript/i })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Compile publication' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument()
  })

  it('requires manuscript content before compiling', () => {
    const onCreate = vi.fn()

    render(<PublicationCreatePage onBack={() => undefined} onCreate={onCreate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Compile publication' }))

    expect(screen.getByText('Paste a manuscript before compiling the publication.')).toBeInTheDocument()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('compiles pasted manuscript content and submits a compiled publication', () => {
    const onCreate = vi.fn()

    render(<PublicationCreatePage onBack={() => undefined} onCreate={onCreate} />)

    fireEvent.change(screen.getByRole('textbox', { name: /manuscript/i }), {
      target: {
        value: `# Gentle Focus Journal\n\n## Begin here\n\n### What do I need today?\n\n[[GP:RESPONSE size="long"]]`,
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Compile publication' }))

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Gentle Focus Journal',
        creationMode: 'compiled',
        content: {
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'heading',
              text: 'Begin here',
            }),
            expect.objectContaining({
              type: 'multiline-text-field',
              text: 'What do I need today?',
              responseSize: 'long',
            }),
          ]),
        },
      }),
    )
  })

  it('auto-compiles a readable DOCX even when import diagnostics are advisory', async () => {
    mockedImportDocxManuscript.mockResolvedValueOnce({
      manuscript: `# Imported Journal\n\n## Reflection\n\n### What do I need today?\n\n[[GP:RESPONSE size="long"]]`,
      diagnostics: [
        {
          code: 'table-preserved-as-markdown',
          message: 'A Word table was preserved as structured Markdown for compilation.',
        },
      ],
    })

    const onCreate = vi.fn()
    render(<PublicationCreatePage onBack={() => undefined} onCreate={onCreate} />)

    const file = new File(['placeholder'], 'journal.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    Object.defineProperty(file, 'arrayBuffer', {
      value: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    })

    fireEvent.change(screen.getByLabelText(/upload \.docx/i), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Imported Journal',
          creationMode: 'compiled',
        }),
      )
    })

    expect(screen.queryByText('Import details')).not.toBeInTheDocument()
  })

  it('keeps manual creation behind an advanced action', () => {
    render(<PublicationCreatePage onBack={() => undefined} onCreate={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Advanced: start manually' }))

    expect(screen.getByRole('radio', { name: /blank publication/i })).toBeChecked()
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
  })

  it('connects back and manual cancel actions', () => {
    const onBack = vi.fn()

    render(<PublicationCreatePage onBack={onBack} onCreate={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to publications' }))
    fireEvent.click(screen.getByRole('button', { name: 'Advanced: start manually' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onBack).toHaveBeenCalledTimes(2)
  })
})
