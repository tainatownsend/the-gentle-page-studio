import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { PublicationCreateForm } from './PublicationCreateForm'

describe('PublicationCreateForm', () => {
  it('submits normalized publication values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <PublicationCreateForm
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    )

    await user.type(
      screen.getByRole('textbox', { name: /title/i }),
      '  Gentle Focus Journal  ',
    )

    await user.type(
      screen.getByRole('textbox', { name: /description/i }),
      '  A supportive focus practice.  ',
    )

    await user.click(
      screen.getByRole('button', { name: 'Create draft' }),
    )

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
    })
  })

  it('requires a publication title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <PublicationCreateForm
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Create draft' }),
    )

    expect(
      screen.getByText('Enter a title for your publication.'),
    ).toBeInTheDocument()

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    render(
      <PublicationCreateForm
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Cancel' }),
    )

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
