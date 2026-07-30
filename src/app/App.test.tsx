import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App', () => {
  it('renders the publications workspace', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('ADHD Emotional Regulation Journal'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Daily Clarity Planner'),
    ).toBeInTheDocument()
  })
})
