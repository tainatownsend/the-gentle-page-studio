import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { Button } from './Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save publication</Button>)

    expect(
      screen.getByRole('button', {
        name: 'Save publication',
      }),
    ).toBeInTheDocument()
  })

  it('calls the click handler', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Save</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call the click handler when disabled', () => {
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Save
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disables the button while loading', () => {
    render(<Button loading>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument()
  })

  it('renders start and end icons', () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon">+</span>}
        endIcon={<span data-testid="end-icon">→</span>}
      >
        Continue
      </Button>,
    )

    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it('uses button as the default HTML type', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('allows the HTML button type to be changed', () => {
    render(<Button type="submit">Submit</Button>)

    expect(
      screen.getByRole('button', { name: 'Submit' }),
    ).toHaveAttribute('type', 'submit')
  })

  it('forwards its ref', () => {
    const ref = createRef<HTMLButtonElement>()

    render(<Button ref={ref}>Save</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('accepts additional class names', () => {
    render(<Button className="custom-button">Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'custom-button',
    )
  })
})
