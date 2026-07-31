import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { App } from './App'

function renderApp(initialEntry = '/publications') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  )
}

async function createDraft(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', {
      name: 'Create publication',
    }),
  )

  await user.type(screen.getByRole('textbox', { name: /title/i }), 'Gentle Focus Journal')

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

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('redirects the root path to publications', () => {
    renderApp('/')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })

  it('creates, opens, edits, and saves a publication through routes', async () => {
    const user = userEvent.setup()

    renderApp()
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
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Updated Gentle Journal')).toBeInTheDocument()
  }, 10_000)

  it('returns to publications from the editor without saving', async () => {
    const user = userEvent.setup()

    renderApp()
    await createDraft(user)

    await user.click(
      screen.getByRole('button', {
        name: 'Open',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Gentle Focus Journal')).toBeInTheDocument()
  }, 10_000)

  it('redirects unknown publication editor routes to the library', () => {
    renderApp('/publications/missing-publication/edit')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Create your first publication',
      }),
    ).toBeInTheDocument()
  })

  it('redirects unknown application paths to publications', () => {
    renderApp('/unknown')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })
})
