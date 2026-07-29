import {
  render,
  screen,
} from '@testing-library/react'

import { Input } from '../Input'
import { Field } from './Field'

describe('Field', () => {
  it('associates its label with the control', () => {
    render(
      <Field label="Publication title">
        <Input />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Publication title',
      }),
    ).toBeInTheDocument()
  })

  it('uses a provided control id', () => {
    render(
      <Field
        label="Author name"
        controlId="author-name"
      >
        <Input />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Author name',
      }),
    ).toHaveAttribute('id', 'author-name')
  })

  it('connects the description to the control', () => {
    render(
      <Field
        label="Publication title"
        description="Use a clear and descriptive title."
      >
        <Input />
      </Field>,
    )

    const input = screen.getByRole('textbox', {
      name: 'Publication title',
    })

    const description = screen.getByText(
      'Use a clear and descriptive title.',
    )

    expect(input).toHaveAttribute(
      'aria-describedby',
      description.id,
    )
  })

  it('connects the error message to the control', () => {
    render(
      <Field
        label="Publication title"
        error="A title is required."
      >
        <Input />
      </Field>,
    )

    const input = screen.getByRole('textbox', {
      name: 'Publication title',
    })

    const error = screen.getByRole('alert')

    expect(input).toHaveAttribute(
      'aria-describedby',
      error.id,
    )

    expect(input).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('connects both description and error messages', () => {
    render(
      <Field
        label="Publication title"
        description="Maximum 120 characters."
        error="A title is required."
      >
        <Input />
      </Field>,
    )

    const input = screen.getByRole('textbox', {
      name: 'Publication title',
    })

    const description = screen.getByText(
      'Maximum 120 characters.',
    )

    const error = screen.getByRole('alert')

    expect(
      input.getAttribute('aria-describedby'),
    ).toBe(`${description.id} ${error.id}`)
  })

  it('propagates the required state to the control', () => {
    render(
      <Field
        label="Publication title"
        required
      >
        <Input />
      </Field>,
    )

    expect(
      screen.getByRole('textbox', {
        name: /publication title/i,
      }),
    ).toBeRequired()
  })

  it('renders an accessible required indicator', () => {
    render(
      <Field
        label="Publication title"
        required
      >
        <Input />
      </Field>,
    )

    expect(
      screen.getByText('Required'),
    ).toBeInTheDocument()
  })

  it('renders the optional text by default', () => {
    render(
      <Field label="Subtitle">
        <Input />
      </Field>,
    )

    expect(
      screen.getByText('Optional'),
    ).toBeInTheDocument()
  })

  it('supports custom optional text', () => {
    render(
      <Field
        label="Subtitle"
        optionalText="Recommended"
      >
        <Input />
      </Field>,
    )

    expect(
      screen.getByText('Recommended'),
    ).toBeInTheDocument()
  })

  it('allows optional text to be hidden', () => {
    render(
      <Field
        label="Subtitle"
        optionalText={null}
      >
        <Input />
      </Field>,
    )

    expect(
      screen.queryByText('Optional'),
    ).not.toBeInTheDocument()
  })

  it('accepts custom class names', () => {
    render(
      <Field
        label="Title"
        className="custom-field"
        labelClassName="custom-label"
        contentClassName="custom-content"
        data-testid="field"
      >
        <Input />
      </Field>,
    )

    expect(
      screen.getByTestId('field'),
    ).toHaveClass('custom-field')

    expect(
      screen.getByText('Title'),
    ).toHaveClass('custom-label')

    expect(
      screen.getByRole('textbox').parentElement
        ?.parentElement,
    ).toHaveClass('custom-content')
  })
})
