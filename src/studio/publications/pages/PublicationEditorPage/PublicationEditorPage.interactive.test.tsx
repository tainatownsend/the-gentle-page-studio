import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

describe('PublicationEditorPage interactive blocks', () => {
  it('authors multiline response and checkbox blocks', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage
        publication={createPublicationFixture()}
        onBack={() => undefined}
        onSave={onSave}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add response field' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add checkbox' }))

    expect(screen.getByText('Block 1 · Multiline response')).toBeInTheDocument()
    expect(screen.getByText('Block 2 · Checkbox')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Block 1 response prompt'), {
      target: { value: 'What would support you today?' },
    })
    fireEvent.change(screen.getByLabelText('Block 2 checkbox label'), {
      target: { value: 'I completed this reflection.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0]?.[0].content.blocks).toEqual([
      expect.objectContaining({
        type: 'multiline-text-field',
        text: 'What would support you today?',
      }),
      expect.objectContaining({
        type: 'checkbox-field',
        text: 'I completed this reflection.',
      }),
    ])
  })

  it('renders existing interactive blocks with their field-specific controls', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'response-1',
                type: 'multiline-text-field',
                text: 'Describe what you noticed.',
              },
              {
                id: 'checkbox-1',
                type: 'checkbox-field',
                text: 'Reflection complete',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Block 1 response prompt')).toHaveValue(
      'Describe what you noticed.',
    )
    expect(screen.getByLabelText('Block 2 checkbox label')).toHaveValue('Reflection complete')
  })
})
