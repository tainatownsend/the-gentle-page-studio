import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Stack } from './Stack'

describe('Stack', () => {
  it('renders a vertical layout with the default gap', () => {
    render(
      <Stack data-testid="stack">
        <span>First</span>
        <span>Second</span>
      </Stack>,
    )
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveAttribute('data-gap', 'md')
    expect(stack).toHaveStyle({ gap: '16px' })
  })

  it('supports spacing tokens', () => {
    render(<Stack gap="xl" data-testid="stack" />)
    expect(screen.getByTestId('stack')).toHaveStyle({ gap: '32px' })
  })

  it('supports polymorphic elements and style overrides', () => {
    render(
      <Stack
        as="section"
        aria-label="Pages"
        gap="sm"
        style={{ gap: '40px' }}
      />,
    )
    const stack = screen.getByRole('region', { name: 'Pages' })
    expect(stack).toHaveAttribute('data-gap', 'sm')
    expect(stack).toHaveStyle({ gap: '40px' })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()
    render(<Stack as="section" ref={ref} data-testid="stack" />)
    expect(ref.current).toBe(screen.getByTestId('stack'))
  })
})
