import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Section } from './Section'

describe('Section', () => {
  it('renders its content without requiring a header', () => {
    render(
      <Section>
        <p>Section content</p>
      </Section>,
    )

    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders title, description, actions, and children', () => {
    render(
      <Section
        title="Recent publications"
        description="Continue your latest work."
        actions={<button type="button">View all</button>}
      >
        <article>Publication card</article>
      </Section>,
    )

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Recent publications',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Continue your latest work.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View all' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Publication card')).toBeInTheDocument()
  })

  it('supports a configurable heading level', () => {
    render(
      <Section
        title="Templates"
        headingLevel={3}
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Templates',
      }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Section
        ref={ref}
        data-testid="section"
        className="custom-class"
      />,
    )

    const section = screen.getByTestId('section')

    expect(section).toHaveClass('custom-class')
    expect(ref.current).toBe(section)
  })
})
