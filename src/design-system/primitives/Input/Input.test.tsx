import { createRef } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import styles from './Input.module.css'
import { Input } from './Input'

describe('Input', () => {
  it('renders an accessible input', () => {
    render(<Input aria-label="Publication title" />)

    expect(
      screen.getByRole('textbox', {
        name: 'Publication title',
      }),
    ).toBeInTheDocument()
  })

  it('supports placeholder text', () => {
    render(
      <Input
        aria-label="Title"
        placeholder="Enter a title"
      />,
    )

    expect(
      screen.getByPlaceholderText('Enter a title'),
    ).toBeInTheDocument()
  })

  it('uses the medium size by default', () => {
    render(
      <Input
        aria-label="Title"
        data-testid="title-input"
      />,
    )

    expect(
      screen.getByTestId('title-input').parentElement,
    ).toHaveClass(styles.root, styles.md)
  })

  it('supports explicit sizes', () => {
    render(
      <Input
        aria-label="Title"
        size="lg"
        data-testid="title-input"
      />,
    )

    expect(
      screen.getByTestId('title-input').parentElement,
    ).toHaveClass(styles.lg)
  })

  it('supports the full-width state', () => {
    render(
      <Input
        aria-label="Title"
        fullWidth
        data-testid="title-input"
      />,
    )

    expect(
      screen.getByTestId('title-input').parentElement,
    ).toHaveClass(styles.fullWidth)
  })

  it('marks the input as invalid', () => {
    render(<Input aria-label="Title" invalid />)

    expect(
      screen.getByRole('textbox', { name: 'Title' }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not expose aria-invalid by default', () => {
    render(<Input aria-label="Title" />)

    expect(
      screen.getByRole('textbox', { name: 'Title' }),
    ).not.toHaveAttribute('aria-invalid')
  })

  it('preserves an explicit aria-invalid value', () => {
    render(
      <Input
        aria-label="Title"
        aria-invalid="grammar"
      />,
    )

    expect(
      screen.getByRole('textbox', { name: 'Title' }),
    ).toHaveAttribute('aria-invalid', 'grammar')
  })

  it('supports the disabled state', () => {
    render(<Input aria-label="Title" disabled />)

    expect(
      screen.getByRole('textbox', { name: 'Title' }),
    ).toBeDisabled()
  })

  it('updates its value through user interaction', () => {
    render(<Input aria-label="Title" />)

    const input = screen.getByRole('textbox', {
      name: 'Title',
    })

    fireEvent.change(input, {
      target: {
        value: 'ADHD Emotional Regulation Journal',
      },
    })

    expect(input).toHaveValue(
      'ADHD Emotional Regulation Journal',
    )
  })

  it('renders decorative adornments', () => {
    render(
      <Input
        aria-label="Search"
        startAdornment={<span>⌕</span>}
        endAdornment={<span>×</span>}
      />,
    )

    expect(
      screen.getByTestId('input-start-adornment'),
    ).toHaveAttribute('aria-hidden', 'true')

    expect(
      screen.getByTestId('input-end-adornment'),
    ).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts custom root and input class names', () => {
    render(
      <Input
        aria-label="Title"
        className="custom-root"
        inputClassName="custom-input"
      />,
    )

    const input = screen.getByRole('textbox', {
      name: 'Title',
    })

    expect(input.parentElement).toHaveClass('custom-root')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLInputElement>()

    render(<Input ref={ref} aria-label="Title" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('forwards native HTML attributes', () => {
    render(
      <Input
        aria-label="Email"
        type="email"
        name="author-email"
        autoComplete="email"
      />,
    )

    const input = screen.getByRole('textbox', {
      name: 'Email',
    })

    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'author-email')
    expect(input).toHaveAttribute(
      'autocomplete',
      'email',
    )
  })
})
