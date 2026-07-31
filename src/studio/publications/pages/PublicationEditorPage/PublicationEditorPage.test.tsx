import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { PublicationEditorPage } from './PublicationEditorPage'

const publication = {
  id: 'publication-1',
  title: 'Gentle Focus Journal',
  description: 'A supportive focus practice.',
  createdAt: '2026-07-30T22:47:00.000Z',
  updatedAt: '2026-07-30T22:47:00.000Z',
  status: 'draft' as const,
}

describe('PublicationEditorPage', () => {
  it('renders the current publication details', () => {
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

    expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue(
      'A supportive focus practice.',
    )
  })

  it('submits normalized changes', async () => {
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

    await user.clear(titleInput)
    await user.type(titleInput, '  Updated Gentle Journal  ')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, '  Updated description.  ')

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(onSave).toHaveBeenCalledWith({
      title: 'Updated Gentle Journal',
      description: 'Updated description.',
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
