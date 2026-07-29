import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('renders as an accessible toolbar', () => {
    render(
      <Toolbar aria-label="Publication tools">
        <button type="button">Sort</button>
      </Toolbar>,
    )

    expect(
      screen.getByRole('toolbar', {
        name: 'Publication tools',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sort' }),
    ).toBeInTheDocument()
  })

  it('renders start, default, and end content', () => {
    render(
      <Toolbar
        aria-label="Editor tools"
        start={<button type="button">Back</button>}
        end={<button type="button">Save</button>}
      >
        <button type="button">Preview</button>
      </Toolbar>,
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Preview' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('allows the native role to be overridden', () => {
    render(
      <Toolbar
        role="group"
        aria-label="View options"
      />,
    )

    expect(
      screen.getByRole('group', {
        name: 'View options',
      }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLDivElement>()

    render(
      <Toolbar
        ref={ref}
        aria-label="Publication tools"
        data-testid="toolbar"
        className="custom-class"
      />,
    )

    const toolbar = screen.getByTestId('toolbar')

    expect(toolbar).toHaveClass('custom-class')
    expect(ref.current).toBe(toolbar)
  })
})
