import { createRef } from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import { Field } from '../Field'
import styles from './Select.module.css'
import { Select } from './Select'

describe('Select', () => {
  it('renders an accessible native select', () => {
    render(
      <Select aria-label="Publication type">
        <option value="journal">Journal</option>
      </Select>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Publication type',
      }),
    ).toBeInTheDocument()
  })

  it('uses the medium size by default', () => {
    render(
      <Select
        aria-label="Publication type"
        data-testid="publication-type"
      >
        <option>Journal</option>
      </Select>,
    )

    expect(
      screen.getByTestId('publication-type'),
    ).toHaveClass(styles.select, styles.md)
  })

  it('supports explicit sizes', () => {
    render(
      <Select
        aria-label="Publication type"
        size="lg"
        data-testid="publication-type"
      >
        <option>Journal</option>
      </Select>,
    )

    expect(
      screen.getByTestId('publication-type'),
    ).toHaveClass(styles.lg)
  })

  it('supports the full-width state', () => {
    render(
      <Select
        aria-label="Publication type"
        fullWidth
        data-testid="publication-type"
      >
        <option>Journal</option>
      </Select>,
    )

    expect(
      screen.getByTestId('publication-type'),
    ).toHaveClass(styles.fullWidth)
  })

  it('marks the select as invalid', () => {
    render(
      <Select aria-label="Publication type" invalid>
        <option>Journal</option>
      </Select>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Publication type',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports the disabled state', () => {
    render(
      <Select aria-label="Publication type" disabled>
        <option>Journal</option>
      </Select>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Publication type',
      }),
    ).toBeDisabled()
  })

  it('updates its selected value', () => {
    render(
      <Select
        aria-label="Publication type"
        defaultValue="journal"
      >
        <option value="journal">Journal</option>
        <option value="planner">Planner</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', {
      name: 'Publication type',
    })

    fireEvent.change(select, {
      target: { value: 'planner' },
    })

    expect(select).toHaveValue('planner')
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLSelectElement>()

    render(
      <Select
        ref={ref}
        aria-label="Publication type"
      >
        <option>Journal</option>
      </Select>,
    )

    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('forwards native HTML attributes', () => {
    render(
      <Select
        aria-label="Publication type"
        name="publication-type"
        autoComplete="off"
      >
        <option>Journal</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', {
      name: 'Publication type',
    })

    expect(select).toHaveAttribute(
      'name',
      'publication-type',
    )
    expect(select).toHaveAttribute(
      'autocomplete',
      'off',
    )
  })

  it('supports a multiple native select', () => {
    render(
      <Select
        aria-label="Publication formats"
        multiple
      >
        <option value="pdf">PDF</option>
        <option value="epub">EPUB</option>
      </Select>,
    )

    expect(
      screen.getByRole('listbox', {
        name: 'Publication formats',
      }),
    ).toHaveAttribute('multiple')
  })

  it('integrates with Field label association', () => {
    render(
      <Field label="Publication type">
        <Select>
          <option value="">Choose a type</option>
          <option value="journal">Journal</option>
        </Select>
      </Field>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Publication type',
      }),
    ).toBeInTheDocument()
  })

  it('inherits description, error, and required state', () => {
    render(
      <Field
        label="Publication type"
        description="Choose the closest format."
        error="A publication type is required."
        required
      >
        <Select>
          <option value="">Choose a type</option>
        </Select>
      </Field>,
    )

    const select = screen.getByRole('combobox', {
      name: /publication type/i,
    })

    expect(select).toBeRequired()
    expect(select).toHaveAttribute(
      'aria-invalid',
      'true',
    )

    const describedBy =
      select.getAttribute('aria-describedby')

    expect(describedBy).toContain('-description')
    expect(describedBy).toContain('-error')
  })

  it('preserves an explicit select id', () => {
    render(
      <Field
        label="Publication type"
        controlId="field-publication-type"
      >
        <Select
          id="explicit-publication-type"
          aria-label="Explicit publication type"
        >
          <option>Journal</option>
        </Select>
      </Field>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Explicit publication type',
      }),
    ).toHaveAttribute(
      'id',
      'explicit-publication-type',
    )
  })

  it('combines explicit and field descriptions', () => {
    render(
      <>
        <span id="external-help">External help</span>

        <Field
          label="Publication type"
          description="Field help"
        >
          <Select aria-describedby="external-help">
            <option>Journal</option>
          </Select>
        </Field>
      </>,
    )

    const select = screen.getByRole('combobox', {
      name: 'Publication type',
    })

    expect(
      select.getAttribute('aria-describedby'),
    ).toContain('external-help')

    expect(
      select.getAttribute('aria-describedby'),
    ).toContain('-description')
  })

  it('allows explicit invalid state to override context', () => {
    render(
      <Field
        label="Publication type"
        error="Field error"
      >
        <Select
          invalid={false}
          aria-invalid="false"
        >
          <option>Journal</option>
        </Select>
      </Field>,
    )

    expect(
      screen.getByRole('combobox', {
        name: 'Publication type',
      }),
    ).toHaveAttribute('aria-invalid', 'false')
  })
})
