import { render, screen, within } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage structured content', () => {
  it('renders semantic table blocks as accessible tables', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'table-1',
                type: 'paragraph',
                format: 'table',
                text: '| Area | Capacity |\n| --- | --- |\n| Physical | Low |\n| Mental | Medium |',
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
    expect(within(table).getByRole('columnheader', { name: 'Capacity' })).toBeInTheDocument()
    expect(within(table).getByText('Physical')).toBeInTheDocument()
    expect(within(table).getByText('Medium')).toBeInTheDocument()
    expect(screen.queryByText('| --- | --- |')).not.toBeInTheDocument()
  })

  it('renders rating-scale paragraphs without exposing a Gentle Page directive', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'rating-1',
                type: 'paragraph',
                format: 'rating-scale',
                text: '0   1   2   3   4   5',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(screen.getByText('0   1   2   3   4   5')).toBeInTheDocument()
    expect(screen.queryByText(/GP:RATING/)).not.toBeInTheDocument()
  })
})
