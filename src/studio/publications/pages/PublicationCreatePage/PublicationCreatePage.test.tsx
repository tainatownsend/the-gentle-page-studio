import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { PublicationCreatePage } from './PublicationCreatePage'

describe('PublicationCreatePage', () => {
  it('renders a dedicated creation experience', () => {
    render(<PublicationCreatePage onBack={() => undefined} onCreate={() => undefined} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Create publication',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveFocus()
    expect(screen.getByRole('radio', { name: /blank publication/i })).toBeChecked()
  })

  it('connects back and cancel actions', () => {
    const onBack = vi.fn()

    render(<PublicationCreatePage onBack={onBack} onCreate={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to publications' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onBack).toHaveBeenCalledTimes(2)
  })

  it('submits normalized creation values with the selected template', () => {
    const onCreate = vi.fn()

    render(<PublicationCreatePage onBack={() => undefined} onCreate={onCreate} />)

    fireEvent.click(screen.getByRole('radio', { name: /guided journal/i }))

    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: { value: '  Gentle Focus Journal  ' },
    })

    fireEvent.change(screen.getByRole('textbox', { name: /description/i }), {
      target: { value: '  A supportive focus practice.  ' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect(onCreate).toHaveBeenCalledWith({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      templateId: 'guided-journal',
    })
  })
})
