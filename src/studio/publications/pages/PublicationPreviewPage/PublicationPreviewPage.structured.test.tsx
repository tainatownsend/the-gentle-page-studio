import { render, screen } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage structured content', () => {
  it('renders semantic table blocks as accessible table markup', () => {
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

    const table = document.querySelector('table')
    expect(table).not.toBeNull()
    expect(table?.querySelectorAll('thead th')).toHaveLength(2)
    expect(table?.querySelector('thead th')?.textContent).toBe('Area')
    expect(table?.textContent).toContain('Capacity')
    expect(table?.textContent).toContain('Physical')
    expect(table?.textContent).toContain('Medium')
    expect(table?.textContent).not.toContain('---')
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

    const ratingScale = document.querySelector('[data-publication-format="rating-scale"]')
    expect(ratingScale).not.toBeNull()
    expect(ratingScale?.textContent).toBe('0   1   2   3   4   5')
    expect(screen.queryByText(/GP:RATING/)).not.toBeInTheDocument()
  })
})
