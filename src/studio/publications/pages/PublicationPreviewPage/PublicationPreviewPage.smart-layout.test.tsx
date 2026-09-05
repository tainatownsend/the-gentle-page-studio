import { render, screen } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage smart layout', () => {
  it('renders elastic response allocation metadata from the layout engine', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'response-1',
                type: 'multiline-text-field',
                text: 'What would help today?',
                responseSize: 'short',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const field = screen.getByLabelText('What would help today?')

    expect(field).toHaveAttribute('data-response-size', 'short')
    expect(Number(field.getAttribute('data-allocated-units'))).toBeGreaterThan(0)
  })

  it('surfaces non-blocking focused review for unresolved geometry', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'oversized',
                type: 'paragraph',
                text: 'a'.repeat(3000),
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const readiness = document.querySelector('[data-layout-health="needs-attention"]')

    expect(readiness).not.toBeNull()
    expect(readiness).toHaveTextContent('Review suggested')
    expect(readiness).toHaveTextContent(
      'A content block is taller than one page and may require manual review.',
    )
    expect(screen.getByRole('button', { name: 'Print / Save as PDF' })).toBeEnabled()
  })
})
