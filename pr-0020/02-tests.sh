#!/usr/bin/env bash
set -euo pipefail

echo "Creating PR #0020 tests..."

cat > src/design-system/layouts/PageHeader/PageHeader.test.tsx <<'EOF'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders the page title as a level-one heading', () => {
    render(<PageHeader title="Publications" />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Publications',
      }),
    ).toBeInTheDocument()
  })

  it('renders optional supporting content and actions', () => {
    render(
      <PageHeader
        eyebrow="Workspace"
        title="Publications"
        description="Create and organize your work."
        actions={<button type="button">Create publication</button>}
      />,
    )

    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(
      screen.getByText('Create and organize your work.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create publication' }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLElement>()

    render(
      <PageHeader
        ref={ref}
        data-testid="page-header"
        className="custom-class"
        title="Publications"
      />,
    )

    const header = screen.getByTestId('page-header')

    expect(header).toHaveClass('custom-class')
    expect(ref.current).toBe(header)
  })
})
EOF

cat > src/design-system/layouts/Section/Section.test.tsx <<'EOF'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Section } from './Section'

describe('Section', () => {
  it('renders its content without requiring a header', () => {
    render(
      <Section>
        <p>Section content</p>
      </Section>,
    )

    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders title, description, actions, and children', () => {
    render(
      <Section
        title="Recent publications"
        description="Continue your latest work."
        actions={<button type="button">View all</button>}
      >
        <article>Publication card</article>
      </Section>,
    )

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Recent publications',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Continue your latest work.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'View all' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Publication card')).toBeInTheDocument()
  })

  it('supports a configurable heading level', () => {
    render(
      <Section
        title="Templates"
        headingLevel={3}
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Templates',
      }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLElement>()

    render(
      <Section
        ref={ref}
        data-testid="section"
        className="custom-class"
      />,
    )

    const section = screen.getByTestId('section')

    expect(section).toHaveClass('custom-class')
    expect(ref.current).toBe(section)
  })
})
EOF

cat > src/design-system/layouts/Toolbar/Toolbar.test.tsx <<'EOF'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'

import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('renders as an accessible toolbar', () => {
    render(
      <Toolbar aria-label="Publication tools">
        <button type="button">Sort</button>
      </Toolbar>,
    )

    expect(
      screen.getByRole('toolbar', {
        name: 'Publication tools',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sort' }),
    ).toBeInTheDocument()
  })

  it('renders start, default, and end content', () => {
    render(
      <Toolbar
        aria-label="Editor tools"
        start={<button type="button">Back</button>}
        end={<button type="button">Save</button>}
      >
        <button type="button">Preview</button>
      </Toolbar>,
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Preview' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('allows the native role to be overridden', () => {
    render(
      <Toolbar
        role="group"
        aria-label="View options"
      />,
    )

    expect(
      screen.getByRole('group', {
        name: 'View options',
      }),
    ).toBeInTheDocument()
  })

  it('forwards native attributes, className, and ref', () => {
    const ref = createRef<HTMLDivElement>()

    render(
      <Toolbar
        ref={ref}
        aria-label="Publication tools"
        data-testid="toolbar"
        className="custom-class"
      />,
    )

    const toolbar = screen.getByTestId('toolbar')

    expect(toolbar).toHaveClass('custom-class')
    expect(ref.current).toBe(toolbar)
  })
})
EOF

echo
echo "Tests created."
echo "Next: bash pr-0020/03-docs.sh"
