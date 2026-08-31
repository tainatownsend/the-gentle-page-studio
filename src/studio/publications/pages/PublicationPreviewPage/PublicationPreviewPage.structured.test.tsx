import { render, screen } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage structured content', () => {
  it('renders first-class table blocks as accessible table markup', () => {
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
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const frame = document.querySelector('[data-publication-format="table"]')
    const table = frame?.querySelector('table')
    expect(table).not.toBeNull()
    expect(table?.querySelectorAll('thead th')).toHaveLength(2)
    expect(table?.querySelector('thead th')?.textContent).toBe('Area')
    expect(table?.textContent).toContain('Capacity')
    expect(table?.textContent).toContain('Physical')
    expect(table?.textContent).toContain('Medium')
    expect(table?.textContent).not.toContain('---')
  })

  it('renders first-class rating fields without exposing a Gentle Page directive', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'rating-1',
                type: 'rating-field',
                text: 'Energy right now',
                min: 0,
                max: 5,
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const ratingField = document.querySelector('[data-publication-format="rating-field"]')
    expect(ratingField).not.toBeNull()
    expect(ratingField?.textContent).toContain('Energy right now')
    expect(ratingField?.textContent).toContain('0')
    expect(ratingField?.textContent).toContain('5')
    expect(screen.queryByText(/GP:RATING/)).not.toBeInTheDocument()
  })
})
