import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App', () => {
  it('renders the foundation status', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /publishing workspace/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/foundation ready/i)
  })
})
