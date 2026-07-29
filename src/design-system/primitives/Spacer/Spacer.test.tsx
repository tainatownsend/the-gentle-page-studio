import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Inline } from '../Inline'
import { Spacer } from './Spacer'
import styles from './Spacer.module.css'

describe('Spacer', () => {
  it('renders as a decorative layout element', () => {
    render(<Spacer data-testid="spacer" />)

    const spacer = screen.getByTestId('spacer')

    expect(spacer).toHaveClass(styles.spacer)
    expect(spacer).toHaveAttribute('aria-hidden', 'true')
  })

  it('works inside Inline', () => {
    render(
      <Inline>
        <span>Publication</span>
        <Spacer data-testid="spacer" />
        <button type="button">Save</button>
      </Inline>,
    )

    expect(screen.getByTestId('spacer')).toHaveClass(
      styles.spacer,
    )
    expect(
      screen.getByRole('button', { name: 'Save' }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <Spacer
        data-testid="spacer"
        className="custom-spacer"
        style={{ marginInlineStart: '24px' }}
      />,
    )

    expect(screen.getByTestId('spacer')).toHaveClass(
      styles.spacer,
      'custom-spacer',
    )
    expect(screen.getByTestId('spacer')).toHaveStyle({
      marginInlineStart: '24px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLDivElement>()

    render(<Spacer ref={ref} data-testid="spacer" />)

    expect(ref.current).toBe(screen.getByTestId('spacer'))
  })
})
