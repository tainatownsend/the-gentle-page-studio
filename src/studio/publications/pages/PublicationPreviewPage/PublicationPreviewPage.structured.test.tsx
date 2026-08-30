import { render, screen, within } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage structured journal blocks', () => {
  it('renders a semantic table and rating scale from compiled publication blocks', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'table-1',
                type: 'table',
                text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |\n| Mental | Medium |',
              },
              {
                id: 'rating-1',
                type: 'rating-field',
                text: 'Energy right now',
                min: 0,
                max: 3,
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Area' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: 'Physical' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: 'Medium' })).toBeInTheDocument()

    const rating = screen.getByLabelText('Energy right now')
    expect(within(rating).getByText('0')).toBeInTheDocument()
    expect(within(rating).getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download fillable PDF' })).toBeInTheDocument()
  })
})
