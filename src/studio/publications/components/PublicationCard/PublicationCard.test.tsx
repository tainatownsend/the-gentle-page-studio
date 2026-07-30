import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { PublicationCard } from './PublicationCard'

const publication = {
  id: 'publication-1',
  title: 'ADHD Emotional Regulation Journal',
  description: 'A guided journal for everyday emotional clarity.',
  updatedAt: 'July 29, 2026',
  status: 'draft' as const,
}

describe('PublicationCard', () => {
  it('renders publication details in an article', () => {
    render(<PublicationCard publication={publication} />)

    expect(screen.getByRole('article')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: publication.title,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(publication.description),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Updated July 29, 2026'),
    ).toBeInTheDocument()

    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders only the supplied actions', () => {
    render(
      <PublicationCard
        publication={publication}
        onOpen={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Open' }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Duplicate' }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('passes the publication id to action callbacks', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()

    render(
      <PublicationCard
        publication={publication}
        onOpen={onOpen}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Open' }),
    )

    await user.click(
      screen.getByRole('button', { name: 'Duplicate' }),
    )

    await user.click(
      screen.getByRole('button', { name: 'Delete' }),
    )

    expect(onOpen).toHaveBeenCalledWith(publication.id)
    expect(onDuplicate).toHaveBeenCalledWith(publication.id)
    expect(onDelete).toHaveBeenCalledWith(publication.id)
  })

  it('forwards native attributes and className', () => {
    render(
      <PublicationCard
        publication={publication}
        className="custom-class"
        data-testid="publication-card"
      />,
    )

    expect(
      screen.getByTestId('publication-card'),
    ).toHaveClass('custom-class')
  })
})
