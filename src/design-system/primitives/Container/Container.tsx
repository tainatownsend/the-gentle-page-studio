import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import styles from './Container.module.css'

export type ContainerSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'full'

export type ContainerProps<
  T extends ElementType = 'div',
> = {
  as?: T
  size?: ContainerSize
} & Omit<ComponentPropsWithRef<T>, 'as' | 'size'>

export function Container<
  T extends ElementType = 'div',
>({
  as,
  size = 'lg',
  className,
  ...props
}: ContainerProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(
        styles.container,
        styles[size],
        className,
      )}
      data-size={size}
    />
  )
}
