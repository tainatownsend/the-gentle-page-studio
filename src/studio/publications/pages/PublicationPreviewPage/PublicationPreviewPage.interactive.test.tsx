import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import * as publicationExport from '../../export'
import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

afterEach(() => {
  vi.restoreAllMocks()
})

function createInteractivePublication() {
  return createPublicationFixture({
    content: {
      blocks: [
        {
          id: 'response-1',
          type: 'multiline-text-field',
          text: 'What would support you today?',
          responseSize: 'medium',
        },
        {
          id: 'checkbox-1',
          type: 'checkbox-field',
          text: 'I completed this reflection.',
        },
      ],
    },
  })
}

describe('PublicationPreviewPage interactive fields', () => {
  it('renders static multiline and checkbox affordances with fillable export', () => {
    render(
      <PublicationPreviewPage
        publication={createInteractivePublication()}
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

    const responseField = screen.getByLabelText('What would support you today?')
    expect(responseField).toBeInTheDocument()
    expect(responseField).toHaveAttribute('data-response-size', 'medium')
    expect(
      screen.getByRole('button', { name: 'Download fillable PDF' }),
    ).toBeInTheDocument()
  })

  it('does not show fillable export for static-only publications', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'paragraph-1',
                type: 'paragraph',
                text: 'A quiet reflection.',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Download fillable PDF' }),
    ).not.toBeInTheDocument()
  })

  it('recovers when fillable PDF generation fails', async () => {
    vi.spyOn(publicationExport, 'downloadFillablePublicationPdf').mockRejectedValueOnce(
      new Error('serializer unavailable'),
    )

    render(
      <PublicationPreviewPage
        publication={createInteractivePublication()}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Download fillable PDF' }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'The fillable PDF could not be prepared. Your publication is unchanged. Please try again.',
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Download fillable PDF' }),
      ).toBeEnabled()
    })
  })

  it('clears a previous export error when retrying', async () => {
    const download = vi
      .spyOn(publicationExport, 'downloadFillablePublicationPdf')
      .mockRejectedValueOnce(new Error('first attempt failed'))
      .mockResolvedValueOnce(undefined)

    render(
      <PublicationPreviewPage
        publication={createInteractivePublication()}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Download fillable PDF' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Download fillable PDF' }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(download).toHaveBeenCalledTimes(2)
    })
  })
})
