import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Center } from './Center'
import styles from './Center.module.css'

describe('Center', () => {
  it('renders a centered layout', () => {
    render(
      <Center data-testid="center">
        Content
      </Center>,
    )

    expect(screen.getByTestId('center')).toHaveClass(
      styles.center,
    )
  })

  it('supports polymorphic semantic elements', () => {
    render(
      <Center
        as="section"
        aria-label="Loading publication"
      >
        Loading
      </Center>,
    )

    expect(
      screen.getByRole('region', {
        name: 'Loading publication',
      }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <Center
        data-testid="center"
        className="custom-center"
        style={{ minHeight: '200px' }}
      />,
    )

    expect(screen.getByTestId('center')).toHaveClass(
      styles.center,
      'custom-center',
    )
    expect(screen.getByTestId('center')).toHaveStyle({
      minHeight: '200px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Center
        as="section"
        ref={ref}
        data-testid="center"
      />,
    )

    expect(ref.current).toBe(screen.getByTestId('center'))
  })
})
