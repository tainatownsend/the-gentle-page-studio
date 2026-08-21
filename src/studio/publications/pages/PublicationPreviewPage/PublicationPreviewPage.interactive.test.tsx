import { render, screen, within } from '@testing-library/react'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage interactive fields', () => {
  it('renders static multiline and checkbox affordances', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'response-1',
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

    const contentPage = document.querySelector('[aria-label="Publication content page 1"]')

    expect(contentPage).not.toBeNull()
    expect(
      within(contentPage as HTMLElement).getByText('What would support you today?'),
    ).toBeInTheDocument()
    expect(
      within(contentPage as HTMLElement).getByText('I completed this reflection.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('What would support you today?')).toBeInTheDocument()
  })
})
