import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Container } from './Container'
import styles from './Container.module.css'

describe('Container', () => {
  it('renders with the default size', () => {
    render(
      <Container data-testid="container">
        Content
      </Container>,
    )

    const container =
      screen.getByTestId('container')

    expect(container).toHaveClass(
      styles.container,
      styles.lg,
    )
    expect(container).toHaveAttribute(
      'data-size',
      'lg',
    )
  })

  it.each(['sm', 'md', 'lg', 'full'] as const)(
    'supports the %s size',
    (size) => {
      render(
        <Container
          size={size}
          data-testid="container"
        />,
      )

      expect(
        screen.getByTestId('container'),
      ).toHaveClass(
        styles.container,
        styles[size],
      )
    },
  )

  it('supports polymorphic semantic elements and native props', () => {
    render(
      <Container
        as="main"
        aria-label="Publication workspace"
      />,
    )

    expect(
      screen.getByRole('main', {
        name: 'Publication workspace',
      }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <Container
        data-testid="container"
        className="custom-container"
        style={{ minHeight: '300px' }}
      />,
    )

    expect(
      screen.getByTestId('container'),
    ).toHaveClass(
      styles.container,
      'custom-container',
    )
    expect(
      screen.getByTestId('container'),
    ).toHaveStyle({
      minHeight: '300px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Container
        as="main"
        ref={ref}
        data-testid="container"
      />,
    )

    expect(ref.current).toBe(
      screen.getByTestId('container'),
    )
  })
})
