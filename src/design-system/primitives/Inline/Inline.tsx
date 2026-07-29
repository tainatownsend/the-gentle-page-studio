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
import styles from './Inline.module.css'

export type InlineAlign =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline'

export type InlineJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'

export type InlineProps<T extends ElementType = 'div'> = {
  as?: T
  gap?: SpacingToken
  align?: InlineAlign
  justify?: InlineJustify
} & Omit<
  ComponentPropsWithRef<T>,
  'align' | 'as' | 'gap'
>

const alignValues: Record<
  InlineAlign,
  CSSProperties['alignItems']
> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const justifyValues: Record<
  InlineJustify,
  CSSProperties['justifyContent']
> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
}

export function Inline<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  align = 'center',
  justify = 'start',
  className,
  style,
  ...props
}: InlineProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return (
    <Component
      {...props}
      className={cn(styles.inline, className)}
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
