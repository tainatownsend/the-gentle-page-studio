import { createRef } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import { Field } from '../Field'
import styles from './Checkbox.module.css'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders an accessible native checkbox', () => {
    render(<Checkbox label="Publish immediately" />)

    expect(
      screen.getByRole('checkbox', {
        name: 'Publish immediately',
      }),
    ).toBeInTheDocument()
  })

  it('is unchecked by default', () => {
    render(<Checkbox label="Publish immediately" />)

    expect(
      screen.getByRole('checkbox', {
        name: 'Publish immediately',
      }),
    ).not.toBeChecked()
  })

  it('supports the checked state', () => {
    render(
      <Checkbox
        label="Publish immediately"
        checked
        readOnly
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: 'Publish immediately',
      }),
    ).toBeChecked()
  })

  it('supports the defaultChecked state', () => {
    render(
      <Checkbox
        label="Publish immediately"
        defaultChecked
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: 'Publish immediately',
      }),
    ).toBeChecked()
  })

  it('toggles through user interaction', () => {
    render(<Checkbox label="Publish immediately" />)

    const checkbox = screen.getByRole('checkbox', {
      name: 'Publish immediately',
    })

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).not.toBeChecked()
  })

  it('supports the disabled state', () => {
    render(
      <Checkbox
        label="Publish immediately"
        disabled
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: 'Publish immediately',
      }),
    ).toBeDisabled()
  })

  it('supports the required state', () => {
    render(
      <Checkbox
        label="Accept publishing terms"
        required
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: 'Accept publishing terms',
      }),
    ).toBeRequired()
  })

  it('marks the checkbox as invalid', () => {
    render(
      <Checkbox
        label="Accept publishing terms"
        invalid
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: 'Accept publishing terms',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports explicit sizes', () => {
    const { container } = render(
      <Checkbox
        label="Publish immediately"
        size="lg"
      />,
    )

    expect(
      container.querySelector(`.${styles.controlLg}`),
    ).toBeInTheDocument()
  })

  it('supports the full-width state', () => {
    const { container } = render(
      <Checkbox
        label="Publish immediately"
        fullWidth
      />,
    )

    expect(
      container.querySelector(`.${styles.fullWidth}`),
    ).toBeInTheDocument()
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLInputElement>()

    render(
      <Checkbox
        ref={ref}
        label="Publish immediately"
      />,
    )

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'checkbox')
  })

  it('forwards native HTML attributes', () => {
    render(
      <Checkbox
        label="Publish immediately"
        name="publish-immediately"
        value="yes"
      />,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: 'Publish immediately',
    })

    expect(checkbox).toHaveAttribute(
      'name',
      'publish-immediately',
    )
    expect(checkbox).toHaveAttribute('value', 'yes')
  })

  it('integrates with Field context', () => {
    render(
      <Field
        label="Publishing preference"
        description="You can change this later."
      >
        <Checkbox label="Publish immediately" />
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: /publish immediately/i,
    })

    expect(
      checkbox.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('inherits error and required state from Field', () => {
    render(
      <Field
        label="Publishing consent"
        error="Consent is required."
        required
      >
        <Checkbox label="I agree to publish this content" />
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: /i agree to publish this content/i,
    })

    expect(checkbox).toBeRequired()
    expect(checkbox).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      checkbox.getAttribute('aria-describedby'),
    ).toContain('-error')
  })

  it('preserves an explicit checkbox id', () => {
    render(
      <Field
        label="Publishing preference"
        controlId="field-publishing-preference"
      >
        <Checkbox
          id="explicit-checkbox"
          label="Publish immediately"
        />
      </Field>,
    )

    expect(
      screen.getByRole('checkbox', {
        name: /publish immediately/i,
      }),
    ).toHaveAttribute('id', 'explicit-checkbox')
  })

  it('combines explicit and Field descriptions', () => {
    render(
      <>
        <span id="external-help">External help</span>

        <Field
          label="Publishing preference"
          description="Field help"
        >
          <Checkbox
            label="Publish immediately"
            aria-describedby="external-help"
          />
        </Field>
      </>,
    )

    const checkbox = screen.getByRole('checkbox', {
      name: /publish immediately/i,
    })

    expect(
      checkbox.getAttribute('aria-describedby'),
    ).toContain('external-help')

    expect(
      checkbox.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('allows explicit invalid state to override context', () => {
    render(
      <Field
        label="Publishing preference"
        error="Field error"
      >
        <Checkbox
          label="Publish immediately"
          invalid={false}
          aria-invalid="false"
        />
      </Field>,
    )

    expect(
      screen.getByRole('checkbox', {
        name: /publish immediately/i,
      }),
    ).toHaveAttribute('aria-invalid', 'false')
  })
})
