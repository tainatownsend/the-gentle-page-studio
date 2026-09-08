import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { PublicationCreateForm } from './PublicationCreateForm'

describe('PublicationCreateForm', () => {
  it('submits normalized publication values as a manual creation', () => {
    const onSubmit = vi.fn()

    render(<PublicationCreateForm onSubmit={onSubmit} onCancel={() => undefined} />)

    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: {
        value: '  Gentle Focus Journal  ',
      },
    })

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /description/i,
      }),
      {
        target: {
          value: '  A supportive focus practice.  ',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create draft',
      }),
    )

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      creationMode: 'manual',
    })
  })

  it('requires a publication title', () => {
    const onSubmit = vi.fn()

    render(<PublicationCreateForm onSubmit={onSubmit} onCancel={() => undefined} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create draft',
      }),
    )

    expect(screen.getByText('Enter a title for your publication.')).toBeInTheDocument()

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the title error after editing', () => {
    render(<PublicationCreateForm onSubmit={() => undefined} onCancel={() => undefined} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create draft',
      }),
    )

    expect(screen.getByText('Enter a title for your publication.')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: {
        value: 'Gentle Focus Journal',
      },
    })

    expect(screen.queryByText('Enter a title for your publication.')).not.toBeInTheDocument()
  })

  it('calls onCancel without submitting', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    render(<PublicationCreateForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
