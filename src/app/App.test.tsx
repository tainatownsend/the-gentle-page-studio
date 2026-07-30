import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { App } from './App'

async function createDraft(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole('button', {
      name: 'Create publication',
    }),
  )

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
}

describe('App', () => {
  it('creates a draft publication from the creation form', async () => {
    const user = userEvent.setup()

    render(<App />)
    await createDraft(user)

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

  it('opens, edits, and saves a publication', async () => {
    const user = userEvent.setup()

    render(<App />)
    await createDraft(user)

    await user.click(
      screen.getByRole('button', {
        name: 'Open',
      }),
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Gentle Focus Journal',
      }),
    ).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', {
      name: /title/i,
    })

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Gentle Journal')

    await user.click(
      screen.getByRole('button', {
        name: 'Save changes',
      }),
    )

    expect(
      screen.getByText('Updated Gentle Journal'),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Publication details',
      }),
    ).not.toBeInTheDocument()
  })
})
