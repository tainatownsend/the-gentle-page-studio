import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { PublicationsPage } from './PublicationsPage'

const publications = [
  {
    id: 'publication-1',
    title: 'ADHD Emotional Regulation Journal',
    description: 'A guided journal for everyday emotional clarity.',
    updatedAt: 'July 29, 2026',
    status: 'draft' as const,
  },
  {
    id: 'publication-2',
    title: 'Daily Clarity Planner',
    description: 'A gentle daily planning system.',
    updatedAt: 'July 28, 2026',
    status: 'published' as const,
  },
]

describe('PublicationsPage', () => {
  it('renders the page shell and publication collection', () => {
    render(<PublicationsPage publications={publications} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('region', {
        name: 'Publications',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('ADHD Emotional Regulation Journal'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Daily Clarity Planner'),
    ).toBeInTheDocument()
  })

  it('connects page and card actions', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onOpen = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()

    render(
      <PublicationsPage
        publications={[publications[0]]}
        onCreate={onCreate}
        onOpen={onOpen}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(
      screen.getByRole('button', { name: 'Duplicate' }),
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith('publication-1')
    expect(onDuplicate).toHaveBeenCalledWith('publication-1')
    expect(onDelete).toHaveBeenCalledWith('publication-1')
  })

  it('renders one focused create action in the empty state', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <PublicationsPage
        publications={[]}
        onCreate={onCreate}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Create your first publication',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Start with one thoughtful idea. You can shape the content, design, and release details as you go.',
      ),
    ).toBeInTheDocument()

    const createButton = screen.getByRole('button', {
      name: 'Create publication',
    })

    expect(
      screen.getAllByRole('button', {
        name: 'Create publication',
      }),
    ).toHaveLength(1)

    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    await user.click(createButton)

    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})
