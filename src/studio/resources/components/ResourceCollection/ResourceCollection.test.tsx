import { render, screen } from '@testing-library/react'
import { BookOpen } from 'lucide-react'
import { vi } from 'vitest'

import { ResourceCollection } from './ResourceCollection'

type Resource = {
  id: string
  title: string
}

const resources: Resource[] = [
  {
    id: 'resource-1',
    title: 'Emotional Regulation Journal',
  },
  {
    id: 'resource-2',
    title: 'Daily Clarity Planner',
  },
]

describe('ResourceCollection', () => {
  it('renders every resource', () => {
    render(
      <ResourceCollection
        aria-label="Resources"
        resources={resources}
        getResourceKey={(resource) => resource.id}
        renderResource={(resource) => (
          <article>{resource.title}</article>
        )}
      />,
    )

    expect(
      screen.getByRole('region', {
        name: 'Resources',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Emotional Regulation Journal'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Daily Clarity Planner'),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('calls renderResource for each resource', () => {
    const renderResource = vi.fn(
      (resource: Resource, index: number) => (
        <span>
          {index}: {resource.title}
        </span>
      ),
    )

    render(
      <ResourceCollection
        resources={resources}
        getResourceKey={(resource) => resource.id}
        renderResource={renderResource}
      />,
    )

    expect(renderResource).toHaveBeenCalledTimes(2)
    expect(renderResource).toHaveBeenNthCalledWith(
      1,
      resources[0],
      0,
    )
    expect(renderResource).toHaveBeenNthCalledWith(
      2,
      resources[1],
      1,
    )
  })

  it('renders the configured empty state', () => {
    render(
      <ResourceCollection
        resources={[]}
        getResourceKey={(resource: Resource) => resource.id}
        renderResource={(resource) => (
          <article>{resource.title}</article>
        )}
        emptyTitle="Create your first resource"
        emptyDescription="Start with a journal, planner, or workbook."
        emptyIcon={<BookOpen data-testid="empty-icon" />}
        emptyActions={<button type="button">Create resource</button>}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Create your first resource',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Start with a journal, planner, or workbook.',
      ),
    ).toBeInTheDocument()

    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Create resource',
      }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('uses a default empty-state title', () => {
    render(
      <ResourceCollection<Resource>
        resources={[]}
        getResourceKey={(resource) => resource.id}
        renderResource={(resource) => (
          <article>{resource.title}</article>
        )}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'No resources yet',
      }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes and className', () => {
    render(
      <ResourceCollection
        aria-label="Resource library"
        className="custom-class"
        data-testid="resource-collection"
        resources={resources}
        getResourceKey={(resource) => resource.id}
        renderResource={(resource) => (
          <article>{resource.title}</article>
        )}
      />,
    )

    const collection = screen.getByTestId(
      'resource-collection',
    )

    expect(collection).toHaveClass('custom-class')
    expect(collection).toHaveAttribute(
      'aria-label',
      'Resource library',
    )
  })
})
