import { render, screen } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage interactive fields', () => {
  it('renders multiline response and checkbox affordances', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'field-1',
                type: 'multiline-text-field',
                text: 'What would support you today?',
              },
              {
                id: 'checkbox-1',
                type: 'checkbox-field',
                text: 'I completed this reflection.',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      screen.getByRole('region', {
        name: 'What would support you today?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('I completed this reflection.')).toBeInTheDocument()
  })
})
