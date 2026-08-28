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

async function openCreatePage(user: ReturnType<typeof userEvent.setup>) {
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
}

async function createManualDraft(user: ReturnType<typeof userEvent.setup>) {
  await openCreatePage(user)
  await user.click(screen.getByRole('button', { name: 'Advanced: start manually' }))

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

    await openCreatePage(user)

    expect(screen.getByRole('textbox', { name: /manuscript/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Create your first publication',
      }),
    ).not.toBeInTheDocument()
  })

  it('compiles a manuscript and continues directly in preview', async () => {
    const user = userEvent.setup()

    renderApp()
    await openCreatePage(user)

    await user.type(
      screen.getByRole('textbox', { name: /manuscript/i }),
      '# Gentle Focus Journal{enter}{enter}## Begin here{enter}{enter}A gentle starting point.',
    )
    await user.click(screen.getByRole('button', { name: 'Compile publication' }))

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Gentle Focus Journal',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('A gentle starting point.')).toBeInTheDocument()
  }, 10_000)

  it('keeps manual creation available and continues directly in the editor', async () => {
    const user = userEvent.setup()

    renderApp()
    await createManualDraft(user)

    expect(screen.getByText('Publication editor')).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Gentle Focus Journal')
  }, 10_000)

  it('creates, edits, and saves a publication through manual routes', async () => {
    const user = userEvent.setup()

    renderApp()
    await createManualDraft(user)

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

  it('returns to publications when manual creation is cancelled', async () => {
    const user = userEvent.setup()

    renderApp('/publications/new')

    await user.click(screen.getByRole('button', { name: 'Advanced: start manually' }))
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
