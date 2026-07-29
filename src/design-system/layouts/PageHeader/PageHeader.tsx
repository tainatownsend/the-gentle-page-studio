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
