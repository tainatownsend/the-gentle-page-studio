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


  it('renders the approved Gate B daily tools and sensory-reset structures', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          title: 'The Steady State',
          content: {
            blocks: [
              {
                id: 'tools-heading',
                type: 'heading',
                level: 2,
                text: 'Daily Regulation Tools',
                layout: { pageTemplate: 'tool-overview' },
              },
              { id: 'breathe', type: 'heading', level: 3, text: 'Breathe' },
              { id: 'breathe-copy', type: 'paragraph', text: 'Reset your body in 2 minutes.' },
              { id: 'move', type: 'heading', level: 3, text: 'Move' },
              { id: 'move-copy', type: 'paragraph', text: 'Release tension gently.' },
              { id: 'ground', type: 'heading', level: 3, text: 'Ground' },
              { id: 'ground-copy', type: 'paragraph', text: 'Come back to the present.' },
              { id: 'soothe', type: 'heading', level: 3, text: 'Soothe' },
              { id: 'soothe-copy', type: 'paragraph', text: 'Calm your senses.' },
              { id: 'refocus', type: 'heading', level: 3, text: 'Refocus' },
              { id: 'refocus-copy', type: 'paragraph', text: 'Bring back attention.' },
              { id: 'connect', type: 'heading', level: 3, text: 'Connect' },
              { id: 'connect-copy', type: 'paragraph', text: 'Feel supported and less alone.' },
              {
                id: 'sensory-heading',
                type: 'heading',
                level: 2,
                text: 'Sensory Reset',
                layout: { pageTemplate: 'sensory-reset' },
              },
              { id: 'sight', type: 'heading', level: 3, text: 'Sight' },
              { id: 'sight-copy', type: 'paragraph', text: 'Look at something calming.' },
              { id: 'sound', type: 'heading', level: 3, text: 'Sound' },
              { id: 'sound-copy', type: 'paragraph', text: 'Listen to a grounding sound.' },
              { id: 'touch', type: 'heading', level: 3, text: 'Touch' },
              { id: 'touch-copy', type: 'paragraph', text: 'Hold something soothing.' },
              { id: 'smell', type: 'heading', level: 3, text: 'Smell' },
              { id: 'smell-copy', type: 'paragraph', text: 'Use a calming scent.' },
              { id: 'taste', type: 'heading', level: 3, text: 'Taste' },
              { id: 'taste-copy', type: 'paragraph', text: 'Have a sip of water or tea.' },
              {
                id: 'sensory-notes',
                type: 'multiline-text-field',
                text: 'My go-to sensory tools',
                responseSize: 'medium',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      document.querySelectorAll(
        '[data-template-region="tool-overview-grid"] [data-tool-overview-card]',
      ),
    ).toHaveLength(6)
    expect(
      document.querySelectorAll(
        '[data-template-region="sensory-reset-list"] [data-sensory-reset-item]',
      ),
    ).toHaveLength(5)
    expect(screen.getByText('My go-to sensory tools')).toBeInTheDocument()
  })


  it('renders Gate B front matter with numbered navigation rows and dedicated opener pages', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          title: 'The Steady State',
          content: {
            blocks: [
              {
                id: 'how-heading',
                type: 'heading',
                level: 2,
                text: 'How to Use This Journal',
                layout: { pageTemplate: 'navigation' },
              },
              { id: 'step-1', type: 'heading', level: 3, text: 'Start where you are' },
              { id: 'step-1-copy', type: 'paragraph', text: 'No right or wrong order.' },
              { id: 'step-2', type: 'heading', level: 3, text: 'Use what feels helpful' },
              { id: 'step-2-copy', type: 'paragraph', text: 'Try, adapt, make it yours.' },
              { id: 'step-3', type: 'heading', level: 3, text: 'Be kind to your process' },
              { id: 'step-3-copy', type: 'paragraph', text: 'Progress over perfection.' },
              { id: 'step-4', type: 'heading', level: 3, text: 'Return when you need' },
              { id: 'step-4-copy', type: 'paragraph', text: 'This is a safe space for you.' },
              {
                id: 'welcome-heading',
                type: 'heading',
                level: 2,
                text: 'Let’s Begin',
                layout: { pageTemplate: 'section-opener' },
              },
              {
                id: 'welcome-copy',
                type: 'paragraph',
                text: 'A kinder approach to progress.',
              },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      document.querySelectorAll(
        '[data-template-region="navigation-rows"] [data-navigation-row]',
      ),
    ).toHaveLength(4)
    expect(screen.getByText('Start where you are')).toBeInTheDocument()
    expect(screen.getByText('Return when you need')).toBeInTheDocument()
    expect(
      document.querySelector('[data-page-template="section-opener"]'),
    ).not.toBeNull()
  })


  it('renders Gate C triggers as two scans and regulation menu as five action rows', () => {
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({
          title: 'The Steady State',
          content: {
            blocks: [
              {
                id: 'triggers-heading',
                type: 'heading',
                level: 2,
                text: 'Triggers & Early Signs',
                layout: { pageTemplate: 'trigger-scan' },
              },
              { id: 'common-heading', type: 'heading', level: 3, text: 'Common Triggers' },
              { id: 'trigger-1', type: 'checkbox-field', text: 'Stress' },
              { id: 'trigger-2', type: 'checkbox-field', text: 'Sensory overload' },
              { id: 'trigger-3', type: 'checkbox-field', text: 'Lack of sleep' },
              { id: 'trigger-4', type: 'checkbox-field', text: 'Hunger' },
              { id: 'trigger-5', type: 'checkbox-field', text: 'Transitions' },
              { id: 'signs-heading', type: 'heading', level: 3, text: 'My Early Signs' },
              { id: 'trigger-6', type: 'checkbox-field', text: 'Racing thoughts' },
              { id: 'trigger-7', type: 'checkbox-field', text: 'Tension in body' },
              { id: 'trigger-8', type: 'checkbox-field', text: 'Irritability' },
              { id: 'trigger-9', type: 'checkbox-field', text: 'Brain fog' },
              { id: 'trigger-10', type: 'checkbox-field', text: 'Difficulty focusing' },
              {
                id: 'trigger-response',
                type: 'multiline-text-field',
                text: 'What I can do when I notice these signs',
                responseSize: 'medium',
              },
              {
                id: 'menu-heading',
                type: 'heading',
                level: 2,
                text: 'Regulation Menu',
                layout: { pageTemplate: 'regulation-menu' },
              },
              { id: 'quick', type: 'multiline-text-field', text: 'Quick Reset · 1–5 minutes', responseSize: 'short' },
              { id: 'move', type: 'multiline-text-field', text: 'Move Your Body · 5–15 minutes', responseSize: 'short' },
              { id: 'soothe', type: 'multiline-text-field', text: 'Soothe Your Senses · 5–15 minutes', responseSize: 'short' },
              { id: 'calm', type: 'multiline-text-field', text: 'Calm Your Mind · 5–15 minutes', responseSize: 'short' },
              { id: 'reconnect', type: 'multiline-text-field', text: 'Reconnect · Anytime', responseSize: 'short' },
            ],
          },
        })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )

    expect(
      document.querySelectorAll(
        '[data-template-region="trigger-columns"] [data-trigger-column]',
      ),
    ).toHaveLength(2)
    expect(
      document.querySelectorAll(
        '[data-template-region="regulation-menu-rows"] [data-regulation-menu-row]',
      ),
    ).toHaveLength(5)
    expect(
      screen.getByText('What I can do when I notice these signs'),
    ).toBeInTheDocument()
  })

})
