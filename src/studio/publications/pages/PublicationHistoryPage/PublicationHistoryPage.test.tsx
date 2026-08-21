import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { createPublicationFixture } from '../../testing'
import type { PublicationRevision } from '../../types'
import { PublicationHistoryPage } from './PublicationHistoryPage'

const publication = createPublicationFixture({
  id: 'publication-1',
  title: 'Gentle Focus Journal',
})

const revisions: PublicationRevision[] = [
  {
    id: 'revision-2',
    publicationId: publication.id,
    title: 'Gentle Focus Journal v2',
    content: {
      blocks: [],
    },
    documentSettings: publication.documentSettings,
    publishedAt: '2026-08-21T06:00:00.000Z',
  },
  {
    id: 'revision-1',
    publicationId: publication.id,
    title: 'Gentle Focus Journal v1',
    content: {
      blocks: [],
    },
    documentSettings: publication.documentSettings,
    publishedAt: '2026-08-21T05:00:00.000Z',
  },
]

describe('PublicationHistoryPage', () => {
  it('renders published versions in newest-first order', () => {
    render(
      <PublicationHistoryPage
        publication={publication}
        revisions={revisions}
        onBack={() => undefined}
        onRestore={() => undefined}
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Gentle Focus Journal',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Version 2')).toBeInTheDocument()
    expect(screen.getByText('Version 1')).toBeInTheDocument()
    expect(screen.getAllByRole('time')).toHaveLength(2)
  })

  it('renders a focused empty history state', () => {
    render(
      <PublicationHistoryPage
        publication={publication}
        revisions={[]}
        onBack={() => undefined}
        onRestore={() => undefined}
      />,
    )

    expect(screen.getByText('No published versions yet')).toBeInTheDocument()
  })

  it('connects back and restore actions', () => {
    const onBack = vi.fn()
    const onRestore = vi.fn()

    render(
      <PublicationHistoryPage
        publication={publication}
        revisions={revisions}
        onBack={onBack}
        onRestore={onRestore}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to preview',
      }),
    )

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Restore as new draft',
      })[0],
    )

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onRestore).toHaveBeenCalledWith('revision-2')
  })
})
