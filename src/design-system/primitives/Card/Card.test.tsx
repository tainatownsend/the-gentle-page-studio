import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Card } from './Card'
import styles from './Card.module.css'

describe('Card', () => {
  it('renders content with the default padding', () => {
    render(
      <Card data-testid="card">
        Editorial content
      </Card>,
    )

    const card = screen.getByTestId('card')

    expect(card).toHaveTextContent('Editorial content')
    expect(card).toHaveClass(
      styles.card,
      styles.md,
    )
    expect(card).toHaveAttribute(
      'data-padding',
      'md',
    )
    expect(card).toHaveAttribute(
      'data-tone',
      'default',
    )
  })

  it.each(['sm', 'md', 'lg'] as const)(
    'supports the %s padding',
    (padding) => {
      render(
        <Card
          padding={padding}
          data-testid="card"
        />,
      )

      expect(screen.getByTestId('card')).toHaveClass(
        styles[padding],
      )
    },
  )

  it('supports Surface tones', () => {
    render(
      <Card
        tone="elevated"
        data-testid="card"
      />,
    )

    expect(screen.getByTestId('card')).toHaveAttribute(
      'data-tone',
      'elevated',
    )
  })

  it('supports semantic elements and native props', () => {
    render(
      <Card
        as="article"
        aria-label="ADHD Emotional Regulation"
      >
        Publication
      </Card>,
    )

    expect(
      screen.getByRole('article', {
        name: 'ADHD Emotional Regulation',
      }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <Card
        data-testid="card"
        className="custom-card"
        style={{ minHeight: '200px' }}
      />,
    )

    expect(screen.getByTestId('card')).toHaveClass(
      styles.card,
      'custom-card',
    )
    expect(screen.getByTestId('card')).toHaveStyle({
      minHeight: '200px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Card
        as="article"
        ref={ref}
        data-testid="card"
      />,
    )

    expect(ref.current).toBe(
      screen.getByTestId('card'),
    )
  })
})
