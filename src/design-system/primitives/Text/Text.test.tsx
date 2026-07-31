import { render, screen } from '@testing-library/react'

import { Text } from './Text'

describe('Text', () => {
  it('renders its content', () => {
    render(<Text>Hello, Gentle Page</Text>)

    expect(screen.getByText('Hello, Gentle Page')).toBeInTheDocument()
  })

  it('supports semantic elements and variants', () => {
    render(
      <Text as="h1" variant="h1" weight="semibold">
        Create with clarity
      </Text>,
    )

    const heading = screen.getByRole('heading', {
      name: 'Create with clarity',
      level: 1,
    })

    expect(heading).toHaveAttribute('data-variant', 'h1')
    expect(heading).toHaveStyle({ fontWeight: 600 })
  })

  it('applies the selected semantic tone', () => {
    render(<Text tone="secondary">Supporting text</Text>)

    expect(screen.getByText('Supporting text')).toHaveAttribute('data-tone', 'secondary')
    expect(screen.getByText('Supporting text')).toHaveStyle({
      color: 'var(--color-text-secondary)',
    })
  })

  it('allows style overrides', () => {
    render(<Text style={{ textAlign: 'center' }}>Centered text</Text>)

    expect(screen.getByText('Centered text')).toHaveStyle({
      textAlign: 'center',
    })
  })
})
