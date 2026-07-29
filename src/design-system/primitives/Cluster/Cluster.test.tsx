import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Cluster } from './Cluster'
import styles from './Cluster.module.css'

describe('Cluster', () => {
  it('renders a wrapping horizontal layout with defaults', () => {
    render(
      <Cluster data-testid="cluster">
        <span>First</span>
        <span>Second</span>
      </Cluster>,
    )

    const cluster = screen.getByTestId('cluster')

    expect(cluster).toHaveClass(styles.cluster)
    expect(cluster).toHaveAttribute('data-gap', 'md')
    expect(cluster).toHaveAttribute('data-align', 'center')
    expect(cluster).toHaveAttribute('data-justify', 'start')
    expect(cluster).toHaveStyle({
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'flex-start',
    })
  })

  it('supports token gap, alignment, and justification', () => {
    render(
      <Cluster
        gap="lg"
        align="baseline"
        justify="between"
        data-testid="cluster"
      />,
    )

    expect(screen.getByTestId('cluster')).toHaveStyle({
      alignItems: 'baseline',
      gap: '24px',
      justifyContent: 'space-between',
    })
  })

  it('supports polymorphic elements and native props', () => {
    render(
      <Cluster
        as="nav"
        aria-label="Publication filters"
        className="custom-cluster"
      />,
    )

    expect(
      screen.getByRole('navigation', {
        name: 'Publication filters',
      }),
    ).toHaveClass(styles.cluster, 'custom-cluster')
  })

  it('allows style overrides', () => {
    render(
      <Cluster
        data-testid="cluster"
        style={{
          gap: '40px',
          justifyContent: 'center',
        }}
      />,
    )

    expect(screen.getByTestId('cluster')).toHaveStyle({
      gap: '40px',
      justifyContent: 'center',
    })
  })

  it('forwards refs', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Cluster
        as="section"
        ref={ref}
        data-testid="cluster"
      />,
    )

    expect(ref.current).toBe(screen.getByTestId('cluster'))
  })
})
