import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactElement,
} from 'react'

import {
  spacing,
  type SpacingToken,
} from '@/core/tokens'

import { cn } from '../../shared'
import styles from './Cluster.module.css'

export type ClusterAlign =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline'

export type ClusterJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'

export type ClusterProps<T extends ElementType = 'div'> = {
  as?: T
  gap?: SpacingToken
  align?: ClusterAlign
  justify?: ClusterJustify
} & Omit<
  ComponentPropsWithRef<T>,
  'align' | 'as' | 'gap'
>

const alignValues: Record<
  ClusterAlign,
  CSSProperties['alignItems']
> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyValues: Record<
  ClusterJustify,
  CSSProperties['justifyContent']
> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
}

export function Cluster<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  align = 'center',
  justify = 'start',
  className,
  style,
  ...props
}: ClusterProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(styles.cluster, className)}
      data-align={align}
      data-gap={gap}
      data-justify={justify}
      style={{
        alignItems: alignValues[align],
        gap: `${spacing[gap]}px`,
        justifyContent: justifyValues[justify],
        ...style,
      }}
    />
  )
}
