import { createRef } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import { Field } from '../Field'
import styles from './Textarea.module.css'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders an accessible textarea', () => {
    render(<Textarea aria-label="Publication summary" />)

    expect(
      screen.getByRole('textbox', {
        name: 'Publication summary',
      }),
    ).toBeInTheDocument()
  })

  it('uses the medium size by default', () => {
    render(
      <Textarea
        aria-label="Summary"
        data-testid="summary"
      />,
    )

    expect(screen.getByTestId('summary')).toHaveClass(
      styles.textarea,
      styles.md,
    )
  })

  it('supports explicit sizes', () => {
    render(
      <Textarea
        aria-label="Summary"
        size="lg"
        data-testid="summary"
      />,
    )

    expect(screen.getByTestId('summary')).toHaveClass(
      styles.lg,
    )
  })

  it('supports the full-width state', () => {
    render(
      <Textarea
        aria-label="Summary"
        fullWidth
        data-testid="summary"
      />,
    )

    expect(screen.getByTestId('summary')).toHaveClass(
      styles.fullWidth,
    )
  })

  it('marks the textarea as invalid', () => {
    render(<Textarea aria-label="Summary" invalid />)

    expect(
      screen.getByRole('textbox', { name: 'Summary' }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports the disabled state', () => {
    render(<Textarea aria-label="Summary" disabled />)

    expect(
      screen.getByRole('textbox', { name: 'Summary' }),
    ).toBeDisabled()
  })

  it('updates its value through user interaction', () => {
    render(<Textarea aria-label="Summary" />)

    const textarea = screen.getByRole('textbox', {
      name: 'Summary',
    })

    fireEvent.change(textarea, {
      target: {
        value: 'A guided journal for emotional clarity.',
      },
    })

    expect(textarea).toHaveValue(
      'A guided journal for emotional clarity.',
    )
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLTextAreaElement>()

    render(<Textarea ref={ref} aria-label="Summary" />)

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('forwards native HTML attributes', () => {
    render(
      <Textarea
        aria-label="Summary"
        name="publication-summary"
        rows={6}
        maxLength={500}
      />,
    )

    const textarea = screen.getByRole('textbox', {
      name: 'Summary',
    })

    expect(textarea).toHaveAttribute(
      'name',
      'publication-summary',
    )
    expect(textarea).toHaveAttribute('rows', '6')
    expect(textarea).toHaveAttribute('maxlength', '500')
  })

  it('supports resize variants', () => {
    render(
      <Textarea
        aria-label="Summary"
        resize="none"
        data-testid="summary"
      />,
    )

    expect(screen.getByTestId('summary')).toHaveClass(
      styles.resizeNone,
    )
  })

  it('integrates with Field label association', () => {
    render(
      <Field label="Publication summary">
        <Textarea />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Publication summary',
      }),
    ).toBeInTheDocument()
  })

  it('inherits description, error, and required state', () => {
    render(
      <Field
        label="Publication summary"
        description="Maximum 500 characters."
        error="A summary is required."
        required
      >
        <Textarea />
      </Field>,
    )

    const textarea = screen.getByRole('textbox', {
      name: /publication summary/i,
    })

    expect(textarea).toBeRequired()
    expect(textarea).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    const describedBy =
      textarea.getAttribute('aria-describedby')

    expect(describedBy).toContain('-description')
    expect(describedBy).toContain('-error')
  })

  it('preserves an explicit textarea id', () => {
    render(
      <Field
        label="Publication summary"
        controlId="field-summary"
      >
        <Textarea
          id="explicit-summary"
          aria-label="Explicit summary"
        />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Explicit summary',
      }),
    ).toHaveAttribute('id', 'explicit-summary')
  })

  it('combines explicit and field descriptions', () => {
    render(
      <>
        <span id="external-help">External help</span>

        <Field
          label="Publication summary"
          description="Field help"
        >
          <Textarea aria-describedby="external-help" />
        </Field>
      </>,
    )

    const textarea = screen.getByRole('textbox', {
      name: 'Publication summary',
    })

    expect(
      textarea.getAttribute('aria-describedby'),
    ).toContain('external-help')

    expect(
      textarea.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('allows explicit invalid state to override context', () => {
    render(
      <Field
        label="Publication summary"
        error="Field error"
      >
        <Textarea
          invalid={false}
          aria-invalid="false"
        />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Publication summary',
      }),
    ).toHaveAttribute('aria-invalid', 'false')
  })
})
