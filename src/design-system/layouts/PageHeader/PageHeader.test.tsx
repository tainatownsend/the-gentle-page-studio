import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders the page title as a level-one heading', () => {
    render(<PageHeader title="Publications" />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })

  it('renders optional supporting content and actions', () => {
    render(
      <PageHeader
        eyebrow="Workspace"
        title="Publications"
        description="Create and organize your work."
        actions={<button type="button">Create publication</button>}
      />,
    )

    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(
      screen.getByText('Create and organize your work.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create publication' }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLElement>()

    render(
      <PageHeader
        ref={ref}
        data-testid="page-header"
        className="custom-class"
        title="Publications"
      />,
    )

    const header = screen.getByTestId('page-header')

    expect(header).toHaveClass('custom-class')
    expect(ref.current).toBe(header)
  })
})
