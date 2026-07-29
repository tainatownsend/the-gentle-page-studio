import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

import {
  spacing,
  type SpacingToken,
} from '@/core/tokens'

import { cn } from '../../shared'
import styles from './Stack.module.css'

export type StackProps<T extends ElementType = 'div'> = {
  as?: T
  gap?: SpacingToken
} & Omit<ComponentPropsWithRef<T>, 'as' | 'gap'>

export function Stack<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  className,
  style,
  ...props
}: StackProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(styles.stack, className)}
      data-gap={gap}
      style={{
        gap: `${spacing[gap]}px`,
        ...style,
      }}
    />
  )
}
