import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

const publication = createPublicationFixture({
  title: 'Gentle Focus Journal',
  description: 'A supportive focus practice.',
})

describe('PublicationEditorPage', () => {
  it('renders publication details and an empty content state', () => {
    render(
      <PublicationEditorPage
        publication={publication}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Gentle Focus Journal',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Gentle Focus Journal')

    expect(
      screen.getByRole('textbox', {
        name: /description/i,
      }),
    ).toHaveValue('A supportive focus practice.')

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('draft')

    expect(screen.getByText('No content blocks yet')).toBeInTheDocument()
  })

  it('renders existing heading and paragraph blocks', () => {
    const publicationWithContent = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'heading-1',
            type: 'heading',
            level: 1,
            text: 'Pause and notice',
          },
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'What feels most present right now?',
          },
        ],
      },
    })

    render(
      <PublicationEditorPage
        publication={publicationWithContent}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Block 1 heading level',
      }),
    ).toHaveValue('1')

    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 heading text',
      }),
    ).toHaveValue('Pause and notice')

    expect(
      screen.getByRole('textbox', {
        name: 'Block 2 paragraph text',
      }),
    ).toHaveValue('What feels most present right now?')
  })

  it('adds headings at level 2 by default', () => {
    render(
      <PublicationEditorPage
        publication={publication}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add heading' }))

    expect(screen.getByText('Block 1 · Heading')).toBeInTheDocument()

    expect(
      screen.getByRole('combobox', {
        name: 'Block 1 heading level',
      }),
    ).toHaveValue('2')
  })

  it('adds, edits, and removes content blocks', () => {
    render(
      <PublicationEditorPage
        publication={publication}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add heading' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Block 1 heading level',
      }),
      {
        target: {
          value: '3',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 1 heading text',
      }),
      {
        target: {
          value: 'A gentle beginning',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 2 paragraph text',
      }),
      {
        target: {
          value: 'Begin with one small step.',
        },
      },
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 heading text',
      }),
    ).toHaveValue('A gentle beginning')

    expect(
      screen.getByRole('combobox', {
        name: 'Block 1 heading level',
      }),
    ).toHaveValue('3')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove block 2',
      }),
    )

    expect(
      screen.queryByRole('textbox', {
        name: 'Block 2 paragraph text',
      }),
    ).not.toBeInTheDocument()
  })

  it('moves content blocks while preserving their values', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'heading-1',
                type: 'heading',
                level: 2,
                text: 'First section',
              },
              {
                id: 'paragraph-1',
                type: 'paragraph',
                text: 'Second block',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Move block 1 up',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Move block 2 down',
      }),
    ).toBeDisabled()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Move block 1 down',
      }),
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 paragraph text',
      }),
    ).toHaveValue('Second block')

    expect(
      screen.getByRole('textbox', {
        name: 'Block 2 heading text',
      }),
    ).toHaveValue('First section')
  })

  it('duplicates a content block directly after its source', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'paragraph-1',
                type: 'paragraph',
                text: 'Repeat this reflection.',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Duplicate block 1',
      }),
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 paragraph text',
      }),
    ).toHaveValue('Repeat this reflection.')

    expect(
      screen.getByRole('textbox', {
        name: 'Block 2 paragraph text',
      }),
    ).toHaveValue('Repeat this reflection.')
  })

  it('returns a published publication to draft after structural edits', () => {
    const publishedPublication = createPublicationFixture({
      status: 'published',
      content: {
        blocks: [
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'Published reflection.',
          },
        ],
      },
    })

    render(
      <PublicationEditorPage
        publication={publishedPublication}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('published')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Duplicate block 1',
      }),
    )

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('draft')
  })

  it('returns a published publication to draft after editing', () => {
    const publishedPublication = createPublicationFixture({
      status: 'published',
    })

    render(
      <PublicationEditorPage
        publication={publishedPublication}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('published')

    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('draft')
  })

  it('submits normalized details and content', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={() => undefined} onSave={onSave} />,
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /title/i,
      }),
      {
        target: {
          value: '  Updated Gentle Journal  ',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /description/i,
      }),
      {
        target: {
          value: '  Updated description.  ',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('combobox', {
        name: 'Status',
      }),
      {
        target: {
          value: 'published',
        },
      },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 1 paragraph text',
      }),
      {
        target: {
          value: '  A saved reflection.  ',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      title: 'Updated Gentle Journal',
      description: 'Updated description.',
      status: 'draft',
      content: {
        blocks: [
          expect.objectContaining({
            type: 'paragraph',
            text: 'A saved reflection.',
          }),
        ],
      },
    })
  })

  it('leaves immediately when no values have changed', () => {
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
  })

  it('protects unsaved content changes from exit', () => {
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add heading' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(onBack).not.toHaveBeenCalled()

    const confirmationDialog = screen
      .getByText('Discard unsaved changes?')
      .closest('[role="alertdialog"]')

    const keepEditingButton = screen.getByText('Keep editing').closest('button')

    expect(confirmationDialog).toHaveAttribute('aria-modal', 'true')
    expect(keepEditingButton).toHaveFocus()
  })

  it('keeps editing when the confirmation is cancelled', () => {
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByText('Keep editing').closest('button') as HTMLButtonElement)

    expect(onBack).not.toHaveBeenCalled()
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 paragraph text',
      }),
    ).toBeInTheDocument()
  })

  it('closes the confirmation with Escape', () => {
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.keyDown(document, {
      key: 'Escape',
    })

    expect(onBack).not.toHaveBeenCalled()
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
  })

  it('discards changes after explicit confirmation', () => {
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add paragraph' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByText('Discard changes').closest('button') as HTMLButtonElement)

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('requires a title before saving', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={() => undefined} onSave={onSave} />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: {
        value: '',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(screen.getByText('Enter a title for your publication.')).toBeInTheDocument()

    expect(onSave).not.toHaveBeenCalled()
  })
})
