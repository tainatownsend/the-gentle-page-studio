import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Inline } from './Inline'

describe('Inline', () => {
  it('renders a horizontal layout with defaults', () => {
    render(
      <Inline data-testid="inline">
        <span>First</span>
        <span>Second</span>
      </Inline>,
    )
    const inline = screen.getByTestId('inline')
    expect(inline).toHaveAttribute('data-gap', 'md')
    expect(inline).toHaveAttribute('data-align', 'center')
    expect(inline).toHaveAttribute('data-justify', 'start')
    expect(inline).toHaveStyle({
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'flex-start',
    })
  })

  it('supports token gap, alignment, and justification', () => {
    render(
      <Inline
        gap="lg"
        align="baseline"
        justify="between"
        data-testid="inline"
      />,
    )
    expect(screen.getByTestId('inline')).toHaveStyle({
      alignItems: 'baseline',
      gap: '24px',
      justifyContent: 'space-between',
    })
  })

  it('supports polymorphic elements and style overrides', () => {
    render(
      <Inline
        as="nav"
        aria-label="Publication actions"
        style={{ justifyContent: 'center' }}
      />,
    )
    expect(
      screen.getByRole('navigation', { name: 'Publication actions' }),
    ).toHaveStyle({ justifyContent: 'center' })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()
    render(<Inline as="nav" ref={ref} data-testid="inline" />)
    expect(ref.current).toBe(screen.getByTestId('inline'))
  })
})
