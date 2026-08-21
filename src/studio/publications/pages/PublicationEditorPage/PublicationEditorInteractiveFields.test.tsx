import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

describe('PublicationEditorPage interactive fields', () => {
  it('adds and edits response and checkbox fields', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture()}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add response field' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add checkbox' }))

    expect(screen.getByText('Block 1 · Response field')).toBeInTheDocument()
    expect(screen.getByText('Block 2 · Checkbox')).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 1 response prompt',
      }),
      {
        target: {
          value: 'What would support you today?',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 2 checkbox label',
      }),
      {
        target: {
          value: 'I completed this reflection.',
        },
      },
    )

    expect(
      screen.getByRole('textbox', {
        name: 'Block 1 response prompt',
      }),
    ).toHaveValue('What would support you today?')
    expect(
      screen.getByRole('textbox', {
        name: 'Block 2 checkbox label',
      }),
    ).toHaveValue('I completed this reflection.')
  })

  it('submits normalized interactive field values', () => {
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

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 1 response prompt',
      }),
      {
        target: {
          value: '  What would support you today?  ',
        },
      },
    )

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Block 2 checkbox label',
      }),
      {
        target: {
          value: '  I completed this reflection.  ',
        },
      },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      title: 'Untitled publication',
      description: undefined,
      status: 'draft',
      content: {
        blocks: [
          expect.objectContaining({
            type: 'multiline-text-field',
            text: 'What would support you today?',
          }),
          expect.objectContaining({
            type: 'checkbox-field',
            text: 'I completed this reflection.',
          }),
        ],
      },
    })
  })

  it('returns a published publication to draft after adding an interactive field', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          status: 'published',
        })}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('published')

    fireEvent.click(screen.getByRole('button', { name: 'Add response field' }))

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('draft')
  })
})
