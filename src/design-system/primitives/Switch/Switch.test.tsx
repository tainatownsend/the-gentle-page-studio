import { createRef } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import { Field } from '../Field'
import styles from './Switch.module.css'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders an accessible native switch', () => {
    render(<Switch label="Enable reminders" />)

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toBeInTheDocument()
  })

  it('is off by default', () => {
    render(<Switch label="Enable reminders" />)

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).not.toBeChecked()
  })

  it('supports the checked state', () => {
    render(
      <Switch
        label="Enable reminders"
        checked
        readOnly
      />,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toBeChecked()
  })

  it('supports the defaultChecked state', () => {
    render(
      <Switch
        label="Enable reminders"
        defaultChecked
      />,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toBeChecked()
  })

  it('toggles through user interaction', () => {
    render(<Switch label="Enable reminders" />)

    const control = screen.getByRole('switch', {
      name: 'Enable reminders',
    })

    fireEvent.click(control)
    expect(control).toBeChecked()

    fireEvent.click(control)
    expect(control).not.toBeChecked()
  })

  it('supports the disabled state', () => {
    render(
      <Switch label="Enable reminders" disabled />,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toBeDisabled()
  })

  it('supports the required state', () => {
    render(
      <Switch
        label="Accept automatic publishing"
        required
      />,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Accept automatic publishing',
      }),
    ).toBeRequired()
  })

  it('marks the switch as invalid', () => {
    render(
      <Switch
        label="Accept automatic publishing"
        invalid
      />,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Accept automatic publishing',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports explicit sizes', () => {
    const { container } = render(
      <Switch
        label="Enable reminders"
        size="lg"
      />,
    )

    expect(
      container.querySelector(`.${styles.trackLg}`),
    ).toBeInTheDocument()

    expect(
      container.querySelector(`.${styles.thumbLg}`),
    ).toBeInTheDocument()
  })

  it('supports the full-width state', () => {
    const { container } = render(
      <Switch
        label="Enable reminders"
        fullWidth
      />,
    )

    expect(
      container.querySelector(`.${styles.fullWidth}`),
    ).toBeInTheDocument()
  })

  it('supports a leading label', () => {
    const { container } = render(
      <Switch
        label="Enable reminders"
        labelPosition="start"
      />,
    )

    expect(
      container.querySelector(
        '[data-label-position="start"]',
      ),
    ).toBeInTheDocument()
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLInputElement>()

    render(
      <Switch
        ref={ref}
        label="Enable reminders"
      />,
    )

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute(
      'role',
      'switch',
    )
  })

  it('forwards native HTML attributes', () => {
    render(
      <Switch
        label="Enable reminders"
        name="enable-reminders"
        value="yes"
      />,
    )

    const control = screen.getByRole('switch', {
      name: 'Enable reminders',
    })

    expect(control).toHaveAttribute(
      'name',
      'enable-reminders',
    )
    expect(control).toHaveAttribute('value', 'yes')
  })

  it('calls native change handlers', () => {
    const onChange = vi.fn()

    render(
      <Switch
        label="Enable reminders"
        onChange={onChange}
      />,
    )

    fireEvent.click(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    )

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('integrates with Field context', () => {
    render(
      <Field
        renderLabel={false}
        label="Reminder settings"
        description="You can change this later."
      >
        <Switch label="Enable reminders" />
      </Field>,
    )

    const control = screen.getByRole('switch', {
      name: 'Enable reminders',
    })

    expect(
      control.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('inherits error and required state from Field', () => {
    render(
      <Field
        renderLabel={false}
        label="Automatic publishing"
        error="You must confirm this setting."
        required
      >
        <Switch label="Enable automatic publishing" />
      </Field>,
    )

    const control = screen.getByRole('switch', {
      name: 'Enable automatic publishing',
    })

    expect(control).toBeRequired()
    expect(control).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      control.getAttribute('aria-describedby'),
    ).toContain('-error')
  })

  it('preserves an explicit switch id', () => {
    render(
      <Field
        label="Reminder settings"
        controlId="field-reminder-settings"
      >
        <Switch
          id="explicit-switch"
          label="Enable reminders"
        />
      </Field>,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toHaveAttribute('id', 'explicit-switch')
  })

  it('combines explicit and Field descriptions', () => {
    render(
      <>
        <span id="external-help">External help</span>

        <Field
        renderLabel={false}
          label="Reminder settings"
          description="Field help"
        >
          <Switch
            label="Enable reminders"
            aria-describedby="external-help"
          />
        </Field>
      </>,
    )

    const control = screen.getByRole('switch', {
      name: 'Enable reminders',
    })

    expect(
      control.getAttribute('aria-describedby'),
    ).toContain('external-help')

    expect(
      control.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('allows explicit invalid state to override context', () => {
    render(
      <Field
        renderLabel={false}
        label="Reminder settings"
        error="Field error"
      >
        <Switch
          label="Enable reminders"
          invalid={false}
          aria-invalid="false"
        />
      </Field>,
    )

    expect(
      screen.getByRole('switch', {
        name: 'Enable reminders',
      }),
    ).toHaveAttribute('aria-invalid', 'false')
  })
})
