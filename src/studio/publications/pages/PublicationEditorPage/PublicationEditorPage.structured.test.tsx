import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationEditorPage } from './PublicationEditorPage'

describe('PublicationEditorPage structured blocks', () => {
  it('allows a rating scale to be corrected without physical layout controls', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
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

    expect(screen.getByText('Block 1 · Rating')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Block 1 rating prompt'), {
      target: { value: 'Energy after this activity' },
    })
    fireEvent.change(screen.getByLabelText('Block 1 rating maximum'), {
      target: { value: '5' },
    })
    fireEvent.change(screen.getByLabelText('Block 1 page placement'), {
      target: { value: 'preferred' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave.mock.calls[0]?.[0].content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'rating-field',
        text: 'Energy after this activity',
        min: 0,
        max: 5,
        layout: expect.objectContaining({ pageBreakBefore: 'preferred' }),
      }),
    )
  })

  it('allows a structured worksheet to be corrected as headings and tab-separated rows', () => {
    const onSave = vi.fn()

    render(
      <PublicationEditorPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'table-1',
                type: 'table',
                text: 'Capacity baseline',
                columns: ['Area', 'Capacity'],
                rows: [['Physical', 'Low']],
              },
            ],
          },
        })}
        onBack={() => undefined}
        onSave={onSave}
      />,
    )

    expect(screen.getByText('Block 1 · Table')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Block 1 table columns'), {
      target: { value: 'Area\nCapacity\nWhat would help?' },
    })
    fireEvent.change(screen.getByLabelText('Block 1 table rows'), {
      target: { value: 'Physical\tLow\tMore rest\nMental\tMedium\tFewer decisions' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave.mock.calls[0]?.[0].content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'table',
        columns: ['Area', 'Capacity', 'What would help?'],
        rows: [
          ['Physical', 'Low', 'More rest'],
          ['Mental', 'Medium', 'Fewer decisions'],
        ],
      }),
    )
  })
})
