import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import { PublicationPreviewPage } from './PublicationPreviewPage'

describe('PublicationPreviewPage', () => {
  it('renders publication metadata and content blocks inside a US Letter page', () => {
    const publication = createPublicationFixture({
      title: 'Gentle Focus Journal',
      description: 'A supportive focus practice.',
      status: 'published',
      content: {
        blocks: [
          { id: 'heading-1', type: 'heading', level: 1, text: 'Pause and notice' },
          { id: 'paragraph-1', type: 'paragraph', text: 'What feels most present right now?' },
          { id: 'heading-2', type: 'heading', level: 2, text: 'Choose one next step' },
        ],
      },
    })

    render(
      <PublicationPreviewPage publication={publication} onBack={() => undefined} onEdit={() => undefined} />,
    )

    const page = document.querySelector('[aria-label="Publication page 1"]')

    expect(page).not.toBeNull()
    expect(page).toHaveAttribute('data-page-size', 'us-letter')
    expect(page).toHaveAttribute('data-orientation', 'portrait')
    expect(document.getElementById('publication-preview-title')).toHaveTextContent('Gentle Focus Journal')
    expect(screen.getByText('Published preview')).toBeInTheDocument()
    expect(screen.getByText('Pause and notice', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('What feels most present right now?')).toBeInTheDocument()
    expect(screen.getByText('Choose one next step', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByLabelText('Page 1')).toHaveTextContent('1')
  })

  it('renders long unbroken content without changing its text', () => {
    const longText = 'vatt'.repeat(80)
    render(
      <PublicationPreviewPage
        publication={createPublicationFixture({ content: { blocks: [{ id: 'paragraph-long', type: 'paragraph', text: longText }] } })}
        onBack={() => undefined}
        onEdit={() => undefined}
      />,
    )
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('renders a focused empty state inside the document page', () => {
    render(
      <PublicationPreviewPage publication={createPublicationFixture()} onBack={() => undefined} onEdit={() => undefined} />,
    )
    expect(screen.getByLabelText('Print-oriented publication preview')).toBeInTheDocument()
    expect(screen.getByText('Nothing to preview yet')).toBeInTheDocument()
  })

  it('connects navigation actions', () => {
    const onBack = vi.fn()
    const onEdit = vi.fn()
    render(<PublicationPreviewPage publication={createPublicationFixture()} onBack={onBack} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Back to publications' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit publication' }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
