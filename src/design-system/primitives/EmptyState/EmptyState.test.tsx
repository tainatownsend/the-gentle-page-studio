import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Button } from '../Button'
import { EmptyState } from './EmptyState'
import styles from './EmptyState.module.css'

describe('EmptyState', () => {
  it('renders a title and description', () => {
    render(
      <EmptyState
        title="No publications yet"
        description="Create your first publication to begin."
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'No publications yet',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Create your first publication to begin.',
      ),
    ).toBeInTheDocument()
  })

  it('renders optional actions', () => {
    render(
      <EmptyState
        title="No publications yet"
        actions={
          <Button>Create publication</Button>
        }
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Create publication',
      }),
    ).toBeInTheDocument()
  })

  it('hides a decorative icon from assistive technology', () => {
    render(
      <EmptyState
        title="No publications yet"
        icon={<span data-testid="icon">+</span>}
      />,
    )

    expect(
      screen.getByTestId('icon').parentElement,
    ).toHaveAttribute('aria-hidden', 'true')
  })

  it('supports start alignment', () => {
    render(
      <EmptyState
        title="No templates found"
        align="start"
        data-testid="empty-state"
      />,
    )

    expect(
      screen.getByTestId('empty-state'),
    ).toHaveClass(
      styles.emptyState,
      styles.start,
    )
    expect(
      screen.getByTestId('empty-state'),
    ).toHaveAttribute('data-align', 'start')
  })

  it('supports semantic elements and native props', () => {
    render(
      <EmptyState
        as="aside"
        title="No recent activity"
        aria-label="Recent activity"
      />,
    )

    expect(
      screen.getByRole('complementary', {
        name: 'Recent activity',
      }),
    ).toBeInTheDocument()
  })

  it('forwards class names and styles', () => {
    render(
      <EmptyState
        title="No results"
        data-testid="empty-state"
        className="custom-empty-state"
        style={{ minHeight: '240px' }}
      />,
    )

    expect(
      screen.getByTestId('empty-state'),
    ).toHaveClass(
      styles.emptyState,
      'custom-empty-state',
    )
    expect(
      screen.getByTestId('empty-state'),
    ).toHaveStyle({
      minHeight: '240px',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <EmptyState
        ref={ref}
        title="No publications yet"
        data-testid="empty-state"
      />,
    )

    expect(ref.current).toBe(
      screen.getByTestId('empty-state'),
    )
  })
})
