import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Divider } from './Divider'
import styles from './Divider.module.css'

describe('Divider', () => {
  it('renders a horizontal separator by default', () => {
    render(<Divider />)

    const divider = screen.getByRole('separator')

    expect(divider).toHaveClass(
      styles.divider,
      styles.horizontal,
    )
    expect(divider).toHaveAttribute(
      'data-orientation',
      'horizontal',
    )
    expect(divider).not.toHaveAttribute(
      'aria-orientation',
    )
  })

  it('supports a vertical orientation', () => {
    render(<Divider orientation="vertical" />)

    const divider = screen.getByRole('separator')

    expect(divider).toHaveClass(
      styles.divider,
      styles.vertical,
    )
    expect(divider).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
    expect(divider).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
  })

  it('forwards class names and styles', () => {
    render(
      <Divider
        className="custom-divider"
        style={{ opacity: 0.5 }}
      />,
    )

    expect(screen.getByRole('separator')).toHaveClass(
      styles.divider,
      'custom-divider',
    )
    expect(screen.getByRole('separator')).toHaveStyle({
      opacity: '0.5',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLDivElement>()

    render(<Divider ref={ref} />)

    expect(ref.current).toBe(
      screen.getByRole('separator'),
    )
  })
})
