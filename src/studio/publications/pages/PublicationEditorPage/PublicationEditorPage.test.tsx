import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

const publication = createPublicationFixture({
  title: 'Gentle Focus Journal',
  description: 'A supportive focus practice.',
})

describe('PublicationEditorPage', () => {
  it('renders the current publication details and status', () => {
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
  })

  it('submits normalized changes and the selected status', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={() => undefined} onSave={onSave} />,
    )

    const titleInput = screen.getByRole('textbox', {
      name: /title/i,
    })
    const descriptionInput = screen.getByRole('textbox', {
      name: /description/i,
    })
    const statusSelect = screen.getByRole('combobox', {
      name: 'Status',
    })

    await user.clear(titleInput)
    await user.type(titleInput, '  Updated Gentle Journal  ')

    await user.clear(descriptionInput)
    await user.type(descriptionInput, '  Updated description.  ')

    await user.selectOptions(statusSelect, 'published')

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(onSave).toHaveBeenCalledWith({
      title: 'Updated Gentle Journal',
      description: 'Updated description.',
      status: 'published',
    })
  })

  it('leaves immediately when no values have changed', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
  })

  it('protects unsaved changes from the back action', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    await user.type(screen.getByRole('textbox', { name: /title/i }), ' updated')

    await user.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(onBack).not.toHaveBeenCalled()

    const confirmationTitle = screen.getByText('Discard unsaved changes?')
    const confirmationDialog = confirmationTitle.closest('[role="alertdialog"]')
    const keepEditingButton = screen.getByText('Keep editing').closest('button')

    expect(confirmationDialog).toBeInTheDocument()
    expect(confirmationDialog).toHaveAttribute('aria-modal', 'true')
    expect(keepEditingButton).toHaveFocus()
  })

  it('keeps editing when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Status',
      }),
      'published',
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByText('Keep editing').closest('button') as HTMLButtonElement)

    expect(onBack).not.toHaveBeenCalled()
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('published')
  })

  it('closes the confirmation with Escape', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    await user.clear(
      screen.getByRole('textbox', {
        name: /description/i,
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.keyboard('{Escape}')

    expect(onBack).not.toHaveBeenCalled()
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
  })

  it('discards changes after explicit confirmation', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={onBack} onSave={() => undefined} />,
    )

    await user.type(screen.getByRole('textbox', { name: /title/i }), ' updated')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByText('Discard changes').closest('button') as HTMLButtonElement)

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('requires a title before saving', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <PublicationEditorPage publication={publication} onBack={() => undefined} onSave={onSave} />,
    )

    await user.clear(screen.getByRole('textbox', { name: /title/i }))

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(screen.getByText('Enter a title for your publication.')).toBeInTheDocument()

    expect(onSave).not.toHaveBeenCalled()
  })
})
