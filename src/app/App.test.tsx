import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { App } from './App'

describe('App', () => {
  it('creates a draft publication from the creation form', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Create publication',
      }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByRole('textbox', { name: /title/i }),
      'Gentle Focus Journal',
    )

    await user.type(
      screen.getByRole('textbox', { name: /description/i }),
      'A supportive focus practice.',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Create draft',
      }),
    )

    expect(
      screen.getByText('Gentle Focus Journal'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('A supportive focus practice.'),
    ).toBeInTheDocument()

    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Updated Just now')).toBeInTheDocument()
  })

  it('returns to the empty state when creation is cancelled', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Create your first publication',
      }),
    ).toBeInTheDocument()
  })
})
