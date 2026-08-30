import { render } from '@testing-library/react'

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

    const table = document.querySelector('[data-publication-block="table"] table')
    expect(table).not.toBeNull()
    expect(table?.querySelector('th')?.textContent).toBe('Area')
    expect(table?.textContent).toContain('Physical')
    expect(table?.textContent).toContain('Medium')

    const rating = document.querySelector('[aria-label="Energy right now"]')
    expect(rating).not.toBeNull()
    expect(rating?.textContent).toContain('0')
    expect(rating?.textContent).toContain('3')

    const fillableButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Download fillable PDF'),
    )
    expect(fillableButton).toBeDefined()
  })
})
