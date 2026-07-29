import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
  ReactNode,
} from 'react'

import { cn } from '../../shared'
import { Stack } from '../Stack'
import { Text } from '../Text'
import styles from './EmptyState.module.css'

export type EmptyStateAlign = 'start' | 'center'

export type EmptyStateProps<
  T extends ElementType = 'section',
> = {
  as?: T
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  align?: EmptyStateAlign
} & Omit<
  ComponentPropsWithRef<T>,
  'as' | 'title' | 'children'
>

export function EmptyState<
  T extends ElementType = 'section',
>({
  as,
  title,
  description,
  icon,
  actions,
  align = 'center',
  className,
  ...props
}: EmptyStateProps<T>): ReactElement | null {
  const Component = as ?? 'section'

  return (
    <Component
      {...props}
      className={cn(
        styles.emptyState,
        styles[align],
        className,
      )}
      data-align={align}
    >
      <Stack
        gap="md"
        className={cn(
          styles.content,
          styles[align],
        )}
      >
        {icon ? (
          <div
            className={styles.icon}
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}

        <Stack
          gap="xs"
          className={cn(
            styles.copy,
            styles[align],
          )}
        >
          <Text
            as="h2"
            className={styles.title}
          >
            {title}
          </Text>

          {description ? (
            <Text
              variant="body"
              className={styles.description}
            >
              {description}
            </Text>
          ) : null}
        </Stack>

        {actions ? (
          <div className={styles.actions}>
            {actions}
          </div>
        ) : null}
      </Stack>
    </Component>
  )
}
