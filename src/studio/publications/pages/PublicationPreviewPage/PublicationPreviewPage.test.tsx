import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PublicationPreviewPage', () => {
  it('renders a fixed Gentle Page cover followed by numbered publication content', () => {
    const publication = createPublicationFixture({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      status: 'published',
      content: {
        blocks: [
          {
            id: 'heading-1',
            type: 'heading',
            level: 1,
            text: 'Pause and notice',
          },
          {
            id: 'paragraph-1',
            type: 'paragraph',
            text: 'What feels most present right now?',
          },
          {
            id: 'heading-2',
            type: 'heading',
            level: 2,
            text: 'Choose one next step',
          },
        ],
      },
    })

    render(
      <PublicationPreviewPage
        publication={publication}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const cover = document.querySelector('[aria-label="Publication cover"]')
    const contentPage = document.querySelector(
      '[aria-label="Publication content page 1"]',
    )

    expect(cover).not.toBeNull()
    expect(contentPage).not.toBeNull()
    expect(cover).toHaveAttribute('data-page-kind', 'cover')
    expect(cover).toHaveAttribute('data-page-size', 'us-letter')
    expect(cover).toHaveAttribute('data-orientation', 'portrait')
    expect(contentPage).toHaveAttribute('data-page-kind', 'content')

    expect(document.getElementById('publication-preview-title')).toHaveTextContent(
      'Gentle Focus Journal',
    )
    expect(within(cover as HTMLElement).getByText('A supportive focus practice.')).toBeInTheDocument()
    expect(
      within(cover as HTMLElement).getByText(
        'Thoughtfully designed tools for everyday clarity.',
      ),
    ).toBeInTheDocument()

    expect(screen.getByText('Published preview')).toBeInTheDocument()

    expect(
      within(contentPage as HTMLElement).getByText('Pause and notice', {
        selector: 'h2',
      }),
    ).toBeInTheDocument()

    expect(
      within(contentPage as HTMLElement).getByText('What feels most present right now?'),
    ).toBeInTheDocument()

    expect(
      within(contentPage as HTMLElement).getByText('Choose one next step', {
        selector: 'h3',
      }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Page 1')).toHaveTextContent('1')
    expect(document.querySelectorAll('article')).toHaveLength(2)
  })

  it('renders automatically derived content pages in sequence', () => {
    const blocks = Array.from({ length: 5 }, (_, index) => ({
      id: `paragraph-${index + 1}`,
      type: 'paragraph' as const,
      text: `${index + 1}-${'a'.repeat(198)}`,
    }))

    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks,
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const firstContentPage = document.querySelector(
      '[aria-label="Publication content page 1"]',
    )
    const secondContentPage = document.querySelector(
      '[aria-label="Publication content page 2"]',
    )

    expect(firstContentPage).not.toBeNull()
    expect(secondContentPage).not.toBeNull()
    expect(
      within(firstContentPage as HTMLElement).getByText(blocks[0].text),
    ).toBeInTheDocument()
    expect(
      within(firstContentPage as HTMLElement).getByText(blocks[3].text),
    ).toBeInTheDocument()
    expect(
      within(secondContentPage as HTMLElement).getByText(blocks[4].text),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Page 1')).toHaveTextContent('1')
    expect(screen.getByLabelText('Page 2')).toHaveTextContent('2')
  })

  it('renders long unbroken content without changing its text', () => {
    const longText = 'vatt'.repeat(80)

    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'paragraph-long',
                type: 'paragraph',
                text: longText,
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('renders a focused empty state on the content page', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture()}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Print-oriented publication preview')).toBeInTheDocument()
    expect(screen.getByText('Nothing to preview yet')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Publication cover"]')).not.toBeNull()
    expect(
      document.querySelector('[aria-label="Publication content page 1"]'),
    ).not.toBeNull()
  })

  it('opens the browser print dialog for print and PDF export', () => {
    const print = vi.spyOn(globalThis, 'print').mockImplementation(() => undefined)

    render(
      <PublicationPreviewPage
        publication={createPublicationFixture()}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Print / Save as PDF',
      }),
    )

    expect(print).toHaveBeenCalledTimes(1)
  })

  it('connects navigation actions', () => {
    const onBack = vi.fn()
    const onEdit = vi.fn()

    render(
      <PublicationPreviewPage
        publication={createPublicationFixture()}
        onBack={onBack}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to publications',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit publication',
      }),
    )

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
