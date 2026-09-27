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
    expect(contentPage).toHaveAttribute('data-page-archetype', 'section-opener')
    expect(contentPage).toHaveAttribute('data-page-density', 'spacious')

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
    expect(screen.getByText('Ready to export')).toBeInTheDocument()
    expect(screen.getByText('1 content page')).toBeInTheDocument()

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

  it('renders automatically derived content pages in balanced sequence', () => {
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
      within(firstContentPage as HTMLElement).getByText(blocks[2].text),
    ).toBeInTheDocument()
    expect(
      within(secondContentPage as HTMLElement).getByText(blocks[3].text),
    ).toBeInTheDocument()
    expect(
      within(secondContentPage as HTMLElement).getByText(blocks[4].text),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Page 1')).toHaveTextContent('1')
    expect(screen.getByLabelText('Page 2')).toHaveTextContent('2')
  })

  it('routes focused layout suggestions to the affected semantic item', () => {
    const onEdit = vi.fn()

    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'oversized-paragraph',
                type: 'paragraph',
                text: 'a'.repeat(3000),
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={onEdit}
      />,
    )

    expect(screen.getByText('Review suggested')).toBeInTheDocument()
    expect(
      screen.getByText('A content block is taller than one page and may require manual review.'),
    ).toBeInTheDocument()

    const pageLink = screen.getByRole('link', { name: 'View page 1' })
    expect(pageLink).toHaveAttribute('href', '#publication-page-1')
    expect(document.getElementById('publication-page-1')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Adjust this item' }))
    expect(onEdit).toHaveBeenLastCalledWith('oversized-paragraph')

    fireEvent.click(screen.getByRole('button', { name: 'Review all adjustments' }))
    expect(onEdit).toHaveBeenLastCalledWith()

    expect(screen.getByRole('button', { name: 'Print / Save as PDF' })).toBeEnabled()
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

  it('connects navigation actions without inventing a focused block', () => {
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
        name: 'Adjust publication',
      }),
    )

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith()
  })

  it('exposes explicit page template intent for template-specific rendering', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          content: {
            blocks: [
              {
                id: 'weekly-heading',
                type: 'heading',
                level: 2,
                text: 'Weekly Reset',
                layout: {
                  pageTemplate: 'weekly-reset',
                },
              },
              {
                id: 'weekly-body',
                type: 'paragraph',
                text: 'Reflect and realign.',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      document.querySelector('[aria-label="Publication content page 1"]'),
    ).toHaveAttribute('data-page-template', 'weekly-reset')
  })


  it('renders Gate A page families with canonical grouped regions', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          title: 'The Steady State',
          description: 'An ADHD Regulation Journal & Toolkit',
          content: {
            blocks: [
              {
                id: 'states-heading',
                type: 'heading',
                level: 2,
                text: 'The 4-State Self-Scan',
                layout: { pageTemplate: 'guided-framework' },
              },
              { id: 'state-1', type: 'checkbox-field', text: 'Hyperarousal' },
              { id: 'state-2', type: 'checkbox-field', text: 'Hypoarousal' },
              { id: 'state-3', type: 'checkbox-field', text: 'Underaroused' },
              { id: 'state-4', type: 'checkbox-field', text: 'Regulated Window' },
              {
                id: 'emergency-heading',
                type: 'heading',
                level: 2,
                text: 'Emergency Unfreeze Protocol',
                layout: { pageTemplate: 'emergency-tool' },
              },
              { id: 'step-1', type: 'heading', level: 3, text: 'Step 1' },
              { id: 'step-1-body', type: 'paragraph', text: 'Physiological interrupt.' },
              { id: 'step-2', type: 'heading', level: 3, text: 'Step 2' },
              { id: 'step-2-body', type: 'paragraph', text: 'Friction reduction.' },
              { id: 'step-3', type: 'heading', level: 3, text: 'Step 3' },
              {
                id: 'micro-slice',
                type: 'multiline-text-field',
                text: 'The micro-slice',
                responseSize: 'medium',
              },
              {
                id: 'daily-heading',
                type: 'heading',
                level: 2,
                text: 'Daily Nervous System Check-in',
                layout: { pageTemplate: 'daily-check-in' },
              },
              {
                id: 'date',
                type: 'multiline-text-field',
                text: 'Date & Time',
                responseSize: 'short',
              },
              { id: 'energy', type: 'rating-field', text: 'Baseline Energy', min: 0, max: 10 },
              {
                id: 'capacity',
                type: 'rating-field',
                text: 'Executive Function Capacity',
                min: 0,
                max: 10,
              },
              { id: 'inventory-heading', type: 'heading', level: 3, text: 'Sensory & Body Inventory' },
              { id: 'inventory-1', type: 'checkbox-field', text: 'High sound sensitivity' },
              { id: 'inventory-2', type: 'checkbox-field', text: 'Screen fatigue' },
              {
                id: 'note',
                type: 'multiline-text-field',
                text: 'A note to myself',
                responseSize: 'long',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(document.querySelectorAll('[data-template-region="state-grid"] [data-publication-block="checkbox"]')).toHaveLength(4)
    expect(document.querySelectorAll('[data-template-region="emergency-steps"] [data-template-step]')).toHaveLength(3)
    expect(document.querySelectorAll('[data-template-region="daily-metrics"] [data-publication-block="rating"]')).toHaveLength(2)
    expect(document.querySelectorAll('[data-template-region="daily-inventory"] [data-publication-block="checkbox"]')).toHaveLength(2)
  })


  it('renders consistent editorial running headers on content pages only', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          title: 'The Steady State',
          content: {
            blocks: [
              {
                id: 'guided-heading',
                type: 'heading',
                level: 2,
                text: 'The 4-State Self-Scan',
                layout: { pageTemplate: 'guided-framework' },
              },
              { id: 'guided-body', type: 'paragraph', text: 'Notice before you fix.' },
              {
                id: 'closing-heading',
                type: 'heading',
                level: 2,
                text: 'You’ve Got This',
                layout: { pageTemplate: 'closing' },
              },
              { id: 'closing-body', type: 'paragraph', text: 'Return when you need to.' },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    const cover = document.querySelector('[aria-label="Publication cover"]')
    const firstPage = document.querySelector('[aria-label="Publication content page 1"]')
    const secondPage = document.querySelector('[aria-label="Publication content page 2"]')

    expect(cover?.querySelector('[data-publication-running-header]')).toBeNull()
    expect(
      within(firstPage as HTMLElement).getByText('The Gentle Page', {
        selector: '[data-publication-running-header] span',
      }),
    ).toBeInTheDocument()
    expect(
      within(firstPage as HTMLElement).getByText('Understanding'),
    ).toBeInTheDocument()
    expect(
      within(secondPage as HTMLElement).getByText('Closing'),
    ).toBeInTheDocument()
  })

})
