import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'

import { PublicationsPage } from './PublicationsPage'

const publications = [
  createPublicationFixture({
    id: 'publication-1',
    title: 'ADHD Emotional Regulation Journal',
    description: 'A guided journal for everyday emotional clarity.',
  }),
  createPublicationFixture({
    id: 'publication-2',
    title: 'Daily Clarity Planner',
    description: 'A gentle daily planning system.',
    status: 'published',
  }),
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

    expect(screen.getByText('ADHD Emotional Regulation Journal')).toBeInTheDocument()

    expect(screen.getByText('Daily Clarity Planner')).toBeInTheDocument()
  })

  it('connects create, open, and duplicate actions', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onOpen = vi.fn()
    const onDuplicate = vi.fn()

    render(
      <PublicationsPage
        publications={[publications[0]]}
        onCreate={onCreate}
        onOpen={onOpen}
        onDuplicate={onDuplicate}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(
      screen.getByRole('button', {
        name: 'Duplicate',
      }),
    )

    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith('publication-1')
    expect(onDuplicate).toHaveBeenCalledWith('publication-1')
  })

  it('requires confirmation before deleting a publication', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<PublicationsPage publications={[publications[0]]} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).not.toHaveBeenCalled()

    const confirmationTitle = screen.getByText('Delete publication?')
    const confirmationDialog = confirmationTitle.closest('[role="alertdialog"]')
    const cancelButton = screen.getByText('Cancel').closest('button')
    const confirmButton = screen.getByText('Delete publication').closest('button')

    expect(confirmationDialog).toBeInTheDocument()
    expect(confirmationDialog).toHaveAttribute('aria-modal', 'true')
    expect(cancelButton).toHaveFocus()
    expect(confirmButton).not.toBeNull()

    await user.click(confirmButton as HTMLButtonElement)

    expect(onDelete).toHaveBeenCalledWith('publication-1')

    expect(screen.queryByText('Delete publication?')).not.toBeInTheDocument()
  })

  it('cancels deletion with Escape', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<PublicationsPage publications={[publications[0]]} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await user.keyboard('{Escape}')

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders one focused create action in the empty state', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(<PublicationsPage publications={[]} onCreate={onCreate} />)

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

  it('renders the creation form instead of the empty state', () => {
    render(
      <PublicationsPage
        publications={[]}
        isCreating
        onCancelCreate={() => undefined}
        onSubmitCreate={() => undefined}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Create publication',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Create your first publication',
      }),
    ).not.toBeInTheDocument()
  })
})
