#!/usr/bin/env bash
set -euo pipefail

echo "Creating PR #0020 layout components..."

mkdir -p src/design-system/layouts/PageHeader
mkdir -p src/design-system/layouts/Section
mkdir -p src/design-system/layouts/Toolbar

cat > src/design-system/layouts/PageHeader/PageHeader.tsx <<'EOF'
import type {
  ComponentPropsWithRef,
  ReactNode,
} from 'react'
import { clsx } from 'clsx'

import styles from './PageHeader.module.css'

export type PageHeaderProps = ComponentPropsWithRef<'header'> & {
  /**
   * Optional contextual label rendered above the title.
   */
  eyebrow?: ReactNode
  /**
   * Main page heading.
   */
  title: ReactNode
  /**
   * Supporting copy rendered below the title.
   */
  description?: ReactNode
  /**
   * Page-level actions rendered beside the heading content.
   */
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  ref,
  ...props
}: PageHeaderProps) {
  const hasSupportingContent = eyebrow || description

  return (
    <header
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    >
      <div className={styles.content}>
        {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}

        <h1 className={styles.title}>{title}</h1>

        {description ? (
          <div className={styles.description}>{description}</div>
        ) : null}

        {!hasSupportingContent ? null : null}
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
EOF

cat > src/design-system/layouts/PageHeader/PageHeader.module.css <<'EOF'
.root {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6, 1.5rem);
  min-width: 0;
}

.content {
  display: grid;
  gap: var(--space-2, 0.5rem);
  min-width: 0;
}

.eyebrow {
  font: inherit;
}

.title {
  margin: 0;
  font: inherit;
}

.description {
  max-width: 70ch;
}

.actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3, 0.75rem);
}

@media (max-width: 42rem) {
  .root {
    flex-direction: column;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }
}
EOF

cat > src/design-system/layouts/PageHeader/index.ts <<'EOF'
export { PageHeader } from './PageHeader'
export type { PageHeaderProps } from './PageHeader'
EOF

cat > src/design-system/layouts/Section/Section.tsx <<'EOF'
import {
  createElement,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react'
import { clsx } from 'clsx'

import styles from './Section.module.css'

export type SectionHeadingLevel = 2 | 3 | 4

export type SectionProps = ComponentPropsWithRef<'section'> & {
  /**
   * Optional section heading.
   */
  title?: ReactNode
  /**
   * Supporting text associated with the section heading.
   */
  description?: ReactNode
  /**
   * Actions associated with this section.
   */
  actions?: ReactNode
  /**
   * Semantic heading level used when title is present.
   *
   * @default 2
   */
  headingLevel?: SectionHeadingLevel
}

export function Section({
  title,
  description,
  actions,
  headingLevel = 2,
  children,
  className,
  ref,
  ...props
}: SectionProps) {
  const hasHeader = title || description || actions
  const Heading = `h${headingLevel}` as const

  return (
    <section
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    >
      {hasHeader ? (
        <div className={styles.header}>
          <div className={styles.headingGroup}>
            {title
              ? createElement(Heading, { className: styles.title }, title)
              : null}

            {description ? (
              <div className={styles.description}>{description}</div>
            ) : null}
          </div>

          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}

      <div className={styles.content}>{children}</div>
    </section>
  )
}
EOF

cat > src/design-system/layouts/Section/Section.module.css <<'EOF'
.root {
  display: grid;
  gap: var(--space-5, 1.25rem);
  min-width: 0;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5, 1.25rem);
  min-width: 0;
}

.headingGroup {
  display: grid;
  gap: var(--space-2, 0.5rem);
  min-width: 0;
}

.title {
  margin: 0;
  font: inherit;
}

.description {
  max-width: 70ch;
}

.actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3, 0.75rem);
}

.content {
  min-width: 0;
}

@media (max-width: 42rem) {
  .header {
    align-items: flex-start;
    flex-direction: column;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }
}
EOF

cat > src/design-system/layouts/Section/index.ts <<'EOF'
export { Section } from './Section'
export type {
  SectionHeadingLevel,
  SectionProps,
} from './Section'
EOF

cat > src/design-system/layouts/Toolbar/Toolbar.tsx <<'EOF'
import type {
  ComponentPropsWithRef,
  ReactNode,
} from 'react'
import { clsx } from 'clsx'

import styles from './Toolbar.module.css'

export type ToolbarProps = ComponentPropsWithRef<'div'> & {
  /**
   * Controls aligned to the start edge.
   */
  start?: ReactNode
  /**
   * Controls aligned to the end edge.
   */
  end?: ReactNode
}

export function Toolbar({
  start,
  end,
  children,
  className,
  ref,
  role = 'toolbar',
  ...props
}: ToolbarProps) {
  return (
    <div
      ref={ref}
      role={role}
      className={clsx(styles.root, className)}
      {...props}
    >
      {start ? <div className={styles.start}>{start}</div> : null}

      {children ? <div className={styles.content}>{children}</div> : null}

      {end ? <div className={styles.end}>{end}</div> : null}
    </div>
  )
}
EOF

cat > src/design-system/layouts/Toolbar/Toolbar.module.css <<'EOF'
.root {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  min-width: 0;
}

.start,
.content,
.end {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  min-width: 0;
}

.content {
  flex: 1 1 auto;
}

.end {
  margin-inline-start: auto;
  justify-content: flex-end;
}

@media (max-width: 42rem) {
  .start,
  .content,
  .end {
    width: 100%;
  }

  .end {
    margin-inline-start: 0;
    justify-content: flex-start;
  }
}
EOF

cat > src/design-system/layouts/Toolbar/index.ts <<'EOF'
export { Toolbar } from './Toolbar'
export type { ToolbarProps } from './Toolbar'
EOF

touch src/design-system/layouts/index.ts

append_export() {
  local export_line="$1"
  local target_file="$2"

  if ! grep -Fqx "$export_line" "$target_file"; then
    printf '\n%s\n' "$export_line" >> "$target_file"
  fi
}

append_export "export * from './PageHeader'" "src/design-system/layouts/index.ts"
append_export "export * from './Section'" "src/design-system/layouts/index.ts"
append_export "export * from './Toolbar'" "src/design-system/layouts/index.ts"

echo
echo "Components created."
echo "Next: bash pr-0020/02-tests.sh"
