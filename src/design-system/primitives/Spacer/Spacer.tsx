import type {
  ComponentPropsWithRef,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import styles from './Spacer.module.css'

export type SpacerProps = ComponentPropsWithRef<'div'>

export function Spacer({
  className,
  ...props
}: SpacerProps): ReactElement | null {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(styles.spacer, className)}
    />
  )
}
