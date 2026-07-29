import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import styles from './Center.module.css'

export type CenterProps<T extends ElementType = 'div'> = {
  as?: T
} & Omit<ComponentPropsWithRef<T>, 'as'>

export function Center<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: CenterProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(styles.center, className)}
    />
  )
}
