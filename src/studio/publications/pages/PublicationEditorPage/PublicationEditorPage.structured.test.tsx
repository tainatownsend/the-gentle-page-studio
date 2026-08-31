import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

describe('PublicationEditorPage structured journal corrections', () => {
  it('edits imported table content and rating range without manual geometry controls', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'table-1',
                type: 'table',
                text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |',
              },
              {
                id: 'rating-1',
                type: 'rating-field',
                text: 'Energy right now',
                min: 0,
                max: 10,
              },
            ],
          },
        })}
        onBack={() => undefined}
        onSave={onSave}
      />,
    )

    expect(screen.getByText('Block 1 · Table')).toBeInTheDocument()
    expect(screen.getByText('Block 2 · Rating scale')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Block 1 table'), {
      target: {
        value: '| Area | Capacity |\n| --- | --- |\n| Physical | Medium |',
      },
    })
    fireEvent.change(screen.getByLabelText('Block 2 rating maximum'), {
      target: { value: '5' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0]?.[0].content.blocks).toEqual([
      expect.objectContaining({
        type: 'table',
        text: expect.stringContaining('| Physical | Medium |'),
      }),
      expect.objectContaining({
        type: 'rating-field',
        text: 'Energy right now',
        min: 0,
        max: 5,
      }),
    ])
  })

  it('adds table and rating blocks as advanced escape hatches', () => {
    render(
      <PublicationEditorPage
        publication={createPublicationFixture()}
        onBack={() => undefined}
        onSave={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add rating' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add table' }))

    expect(screen.getByText('Block 1 · Rating scale')).toBeInTheDocument()
    expect(screen.getByText('Block 2 · Table')).toBeInTheDocument()
    expect(screen.getByLabelText('Block 1 page placement')).toHaveValue('auto')
    expect(screen.getByLabelText('Block 2 page placement')).toHaveValue('auto')
  })
})
