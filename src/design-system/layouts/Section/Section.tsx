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
