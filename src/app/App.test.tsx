import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { App } from './App'

describe('App', () => {
  it('moves from the empty state to a first draft publication', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Create your first publication',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )

    expect(
      screen.getByText('ADHD Emotional Regulation Journal'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    ).toBeInTheDocument()
  })
})
