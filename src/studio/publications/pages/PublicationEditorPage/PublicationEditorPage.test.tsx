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

  it('supports returning a published publication to draft', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <PublicationEditorPage
        publication={{
          ...publication,
          status: 'published',
        }}
        onBack={() => undefined}
        onSave={onSave}
      />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Status',
      }),
      'draft',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(onSave).toHaveBeenCalledWith({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      status: 'draft',
    })
  })

  it('requires a title and supports returning to the library', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onSave = vi.fn()

    render(<PublicationEditorPage publication={publication} onBack={onBack} onSave={onSave} />)

    await user.clear(screen.getByRole('textbox', { name: /title/i }))

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(screen.getByText('Enter a title for your publication.')).toBeInTheDocument()

    expect(onSave).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
