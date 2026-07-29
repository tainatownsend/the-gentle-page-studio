import { createRef, useState } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import { Field } from '../Field'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'
import styles from './RadioGroup.module.css'

function BasicGroup() {
  return (
    <RadioGroup aria-label="Theme">
      <Radio value="light" label="Light" />
      <Radio value="dark" label="Dark" />
      <Radio value="system" label="System" />
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('renders an accessible radio group', () => {
    render(<BasicGroup />)

    expect(
      screen.getByRole('radiogroup', {
        name: 'Theme',
      }),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('supports an uncontrolled default value', () => {
    render(
      <RadioGroup
        aria-label="Theme"
        defaultValue="dark"
      >
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radio', { name: 'Dark' }),
    ).toBeChecked()
  })

  it('updates an uncontrolled value', () => {
    render(<BasicGroup />)

    fireEvent.click(
      screen.getByRole('radio', { name: 'Dark' }),
    )

    expect(
      screen.getByRole('radio', { name: 'Dark' }),
    ).toBeChecked()

    expect(
      screen.getByRole('radio', { name: 'Light' }),
    ).not.toBeChecked()
  })

  it('calls onValueChange', () => {
    const onValueChange = vi.fn()

    render(
      <RadioGroup
        aria-label="Theme"
        onValueChange={onValueChange}
      >
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>,
    )

    fireEvent.click(
      screen.getByRole('radio', { name: 'Dark' }),
    )

    expect(onValueChange).toHaveBeenCalledWith('dark')
  })

  it('supports controlled state', () => {
    function ControlledGroup() {
      const [value, setValue] = useState('light')

      return (
        <RadioGroup
          aria-label="Theme"
          value={value}
          onValueChange={setValue}
        >
          <Radio value="light" label="Light" />
          <Radio value="dark" label="Dark" />
        </RadioGroup>
      )
    }

    render(<ControlledGroup />)

    fireEvent.click(
      screen.getByRole('radio', { name: 'Dark' }),
    )

    expect(
      screen.getByRole('radio', { name: 'Dark' }),
    ).toBeChecked()
  })

  it('gives every radio the same name', () => {
    render(
      <RadioGroup
        aria-label="Theme"
        name="publication-theme"
      >
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>,
    )

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute(
        'name',
        'publication-theme',
      )
    }
  })

  it('disables all radios from the group', () => {
    render(
      <RadioGroup aria-label="Theme" disabled>
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>,
    )

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
    }
  })

  it('supports an individually disabled radio', () => {
    render(
      <RadioGroup aria-label="Theme">
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" disabled />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radio', { name: 'Dark' }),
    ).toBeDisabled()

    expect(
      screen.getByRole('radio', { name: 'Light' }),
    ).not.toBeDisabled()
  })

  it('supports required state', () => {
    render(
      <RadioGroup aria-label="Theme" required>
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radiogroup', {
        name: 'Theme',
      }),
    ).toHaveAttribute('aria-required', 'true')

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired()
    }
  })

  it('supports invalid state', () => {
    render(
      <RadioGroup aria-label="Theme" invalid>
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radiogroup', {
        name: 'Theme',
      }),
    ).toHaveAttribute('aria-invalid', 'true')

    expect(
      screen.getByRole('radio', { name: 'Light' }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports horizontal orientation', () => {
    render(
      <RadioGroup
        aria-label="Theme"
        orientation="horizontal"
      >
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radiogroup', {
        name: 'Theme',
      }),
    ).toHaveClass(styles.horizontal)
  })

  it('supports full width', () => {
    render(
      <RadioGroup aria-label="Theme" fullWidth>
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    expect(
      screen.getByRole('radiogroup', {
        name: 'Theme',
      }),
    ).toHaveClass(styles.fullWidth)
  })

  it('supports explicit sizes', () => {
    const { container } = render(
      <RadioGroup aria-label="Theme" size="lg">
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    expect(
      container.querySelector(`.${styles.controlLg}`),
    ).toBeInTheDocument()
  })

  it('forwards the group ref', () => {
    const ref = createRef<HTMLDivElement>()

    render(
      <RadioGroup
        ref={ref}
        aria-label="Theme"
      >
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute(
      'role',
      'radiogroup',
    )
  })

  it('forwards an individual radio ref', () => {
    const ref = createRef<HTMLInputElement>()

    render(
      <RadioGroup aria-label="Theme">
        <Radio
          ref={ref}
          value="light"
          label="Light"
        />
      </RadioGroup>,
    )

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'radio')
  })

  it('integrates with Field context', () => {
    render(
      <Field
        label="Theme"
        description="Choose a publication theme."
      >
        <RadioGroup aria-label="Theme options">
          <Radio value="light" label="Light" />
          <Radio value="dark" label="Dark" />
        </RadioGroup>
      </Field>,
    )

    expect(
      screen
        .getByRole('radiogroup', {
          name: 'Theme options',
        })
        .getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('inherits error and required state from Field', () => {
    render(
      <Field
        label="Theme"
        error="Select a theme."
        required
      >
        <RadioGroup aria-label="Theme options">
          <Radio value="light" label="Light" />
          <Radio value="dark" label="Dark" />
        </RadioGroup>
      </Field>,
    )

    const group = screen.getByRole('radiogroup', {
      name: 'Theme options',
    })

    expect(group).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(group).toHaveAttribute(
      'aria-required',
      'true',
    )
    expect(
      group.getAttribute('aria-describedby'),
    ).toContain('-error')
  })

  it('preserves explicit group id and descriptions', () => {
    render(
      <>
        <span id="external-help">External help</span>

        <Field
          label="Theme"
          description="Field help"
        >
          <RadioGroup
            id="theme-options"
            aria-label="Theme options"
            aria-describedby="external-help"
          >
            <Radio value="light" label="Light" />
          </RadioGroup>
        </Field>
      </>,
    )

    const group = screen.getByRole('radiogroup', {
      name: 'Theme options',
    })

    expect(group).toHaveAttribute('id', 'theme-options')
    expect(
      group.getAttribute('aria-describedby'),
    ).toContain('external-help')
    expect(
      group.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('preserves native radio attributes and events', () => {
    const onChange = vi.fn()

    render(
      <RadioGroup aria-label="Theme">
        <Radio
          value="light"
          label="Light"
          onChange={onChange}
          data-testid="light-radio"
        />
      </RadioGroup>,
    )

    const radio = screen.getByTestId('light-radio')

    fireEvent.click(radio)

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('prevents selecting a disabled group', () => {
    const onValueChange = vi.fn()

    render(
      <RadioGroup
        aria-label="Theme"
        disabled
        onValueChange={onValueChange}
      >
        <Radio value="light" label="Light" />
      </RadioGroup>,
    )

    fireEvent.click(
      screen.getByRole('radio', { name: 'Light' }),
    )

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
