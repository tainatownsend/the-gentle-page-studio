import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import styles from './Surface.module.css'

export type SurfaceTone =
  | 'default'
  | 'subtle'
  | 'elevated'

export type SurfaceProps<T extends ElementType = 'div'> = {
  as?: T
  tone?: SurfaceTone
} & Omit<ComponentPropsWithRef<T>, 'as'>

export function Surface<T extends ElementType = 'div'>({
  as,
  tone = 'default',
  className,
  ...props
}: SurfaceProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(
        styles.surface,
        styles[tone],
        className,
      )}
      data-tone={tone}
    />
  )
}
