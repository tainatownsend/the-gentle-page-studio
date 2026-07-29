import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

import { cn } from '../../shared'
import { Surface } from '../Surface'
import type { SurfaceTone } from '../Surface'
import styles from './Card.module.css'

export type CardPadding = 'sm' | 'md' | 'lg'

export type CardProps<T extends ElementType = 'div'> = {
  as?: T
  padding?: CardPadding
  tone?: SurfaceTone
} & Omit<
  ComponentPropsWithRef<T>,
  'as'
>

export function Card<T extends ElementType = 'div'>({
  as,
  padding = 'md',
  tone = 'default',
  className,
  ...props
}: CardProps<T>): ReactElement | null {
  return (
    <Surface
      {...(props as ComponentPropsWithRef<T>)}
      as={as}
      tone={tone}
      className={cn(
        styles.card,
        styles[padding],
        className,
      )}
      data-padding={padding}
    />
  )
}
