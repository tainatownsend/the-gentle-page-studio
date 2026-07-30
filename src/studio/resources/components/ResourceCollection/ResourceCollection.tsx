import type {
  ComponentPropsWithRef,
  Key,
  ReactElement,
  ReactNode,
} from 'react'

import { EmptyState } from '@/design-system/primitives/EmptyState'
import { cn } from '@/design-system/shared'

import styles from './ResourceCollection.module.css'

export type ResourceCollectionProps<TResource> = {
  resources: readonly TResource[]
  getResourceKey: (
    resource: TResource,
    index: number,
  ) => Key
  renderResource: (
    resource: TResource,
    index: number,
  ) => ReactNode
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  emptyIcon?: ReactNode
  emptyActions?: ReactNode
} & Omit<ComponentPropsWithRef<'section'>, 'children'>

export function ResourceCollection<TResource>({
  resources,
  getResourceKey,
  renderResource,
  emptyTitle = 'No resources yet',
  emptyDescription,
  emptyIcon,
  emptyActions,
  className,
  ...props
}: ResourceCollectionProps<TResource>): ReactElement {
  if (resources.length === 0) {
    return (
      <EmptyState
        {...props}
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        actions={emptyActions}
        className={className}
      />
    )
  }

  return (
    <section
      {...props}
      className={cn(styles.collection, className)}
    >
      <ul className={styles.grid}>
        {resources.map((resource, index) => (
          <li
            key={getResourceKey(resource, index)}
            className={styles.item}
          >
            {renderResource(resource, index)}
          </li>
        ))}
      </ul>
    </section>
  )
}
