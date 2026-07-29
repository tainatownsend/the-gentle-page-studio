import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Surface } from './Surface'
import styles from './Surface.module.css'

describe('Surface', () => {
  it('renders with the default tone', () => {
    render(
      <Surface data-testid="surface">
        Content
      </Surface>,
    )

    const surface = screen.getByTestId('surface')

    expect(surface).toHaveClass(
      styles.surface,
      styles.default,
    )
    expect(surface).toHaveAttribute(
      'data-tone',
      'default',
    )
  })

  it.each(['subtle', 'elevated'] as const)(
    'supports the %s tone',
    (tone) => {
      render(
        <Surface
          tone={tone}
          data-testid="surface"
        />,
      )

      expect(screen.getByTestId('surface')).toHaveClass(
        styles.surface,
        styles[tone],
      )
      expect(screen.getByTestId('surface')).toHaveAttribute(
        'data-tone',
        tone,
      )
    },
  )

  it('supports polymorphic semantic elements and native props', () => {
    render(
      <Surface
        as="section"
        aria-label="Publication details"
      >
        Details
      </Surface>,
    )

    expect(
      screen.getByRole('region', {
        name: 'Publication details',
      }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <Surface
        data-testid="surface"
        className="custom-surface"
        style={{ minHeight: '200px' }}
      />,
    )

    expect(screen.getByTestId('surface')).toHaveClass(
      styles.surface,
      'custom-surface',
    )
    expect(screen.getByTestId('surface')).toHaveStyle({
      minHeight: '200px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Surface
        as="section"
        ref={ref}
        data-testid="surface"
      />,
    )

    expect(ref.current).toBe(
      screen.getByTestId('surface'),
    )
  })
})
