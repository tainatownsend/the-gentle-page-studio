import type {
  ComponentPropsWithRef,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import styles from './Divider.module.css'

export type DividerOrientation =
  | 'horizontal'
  | 'vertical'

export type DividerProps = {
  orientation?: DividerOrientation
} & Omit<
  ComponentPropsWithRef<'div'>,
  'role'
>

export function Divider({
  orientation = 'horizontal',
  className,
  ...props
}: DividerProps): ReactElement | null {
  return (
    <div
      {...props}
      aria-orientation={
        orientation === 'vertical'
          ? 'vertical'
          : undefined
      }
      className={cn(
        styles.divider,
        styles[orientation],
        className,
      )}
      data-orientation={orientation}
      role="separator"
    />
  )
}
