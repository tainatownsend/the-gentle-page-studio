import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Create publication',
    }),
  ).toBeInTheDocument()

  await user.type(screen.getByRole('textbox', { name: /title/i }), 'Gentle Focus Journal')

  await user.type(
    screen.getByRole('textbox', {
      name: /description/i,
    }),
    'A supportive focus practice.',
  )

  await user.click(
    screen.getByRole('button', {
      name: 'Create draft',
    }),
  )
}

describe('App routing', () => {
  it('redirects the root path to publications', () => {
    renderApp('/')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })

  it('opens publication creation on a dedicated route', async () => {
    const user = userEvent.setup()

    renderApp()

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Create publication',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Create your first publication',
      }),
    ).not.toBeInTheDocument()
  })

  it('creates a draft and continues directly in the editor', async () => {
    const user = userEvent.setup()

    renderApp()
    await createDraft(user)

    expect(screen.getByText('Publication editor')).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Gentle Focus Journal')
  }, 10_000)

  it('creates, edits, and saves a publication through routes', async () => {
    const user = userEvent.setup()

    renderApp()
    await createDraft(user)

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

  it('returns to publications when creation is cancelled', async () => {
    const user = userEvent.setup()

    renderApp('/publications/new')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })

  it('redirects unknown publication editor routes to the library', () => {
    renderApp('/publications/missing-publication/edit')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
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
