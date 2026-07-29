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
