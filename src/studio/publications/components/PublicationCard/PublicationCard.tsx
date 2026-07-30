import type { HTMLAttributes, ReactElement } from 'react'

import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Stack } from '@/design-system/primitives/Stack'
import { Text } from '@/design-system/primitives/Text'
import { cn } from '@/design-system/shared'

import type {
  Publication,
  PublicationStatus,
} from '../../types'

import styles from './PublicationCard.module.css'

export type PublicationCardProps = {
  publication: Publication
  onOpen?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

const statusLabels: Record<PublicationStatus, string> = {
  draft: 'Draft',
  published: 'Published',
}

export function PublicationCard({
  publication,
  onOpen,
  onDuplicate,
  onDelete,
  className,
  ...props
}: PublicationCardProps): ReactElement {
  const hasActions = Boolean(onOpen || onDuplicate || onDelete)

  return (
    <Card
      {...props}
      as="article"
      padding="md"
      className={cn(styles.card, className)}
    >
      <Stack gap="md" className={styles.content}>
        <Cluster align="start" justify="between" gap="sm">
          <Text
            as="h3"
            variant="h3"
            weight="semibold"
            className={styles.title}
          >
            {publication.title}
          </Text>

          <Text
            as="span"
            variant="caption"
            tone="secondary"
            weight="medium"
            className={styles.status}
            data-status={publication.status}
          >
            {statusLabels[publication.status]}
          </Text>
        </Cluster>

        {publication.description ? (
          <Text tone="secondary" className={styles.description}>
            {publication.description}
          </Text>
        ) : null}

        {publication.updatedAt ? (
          <Text variant="bodySmall" tone="tertiary">
            Updated {publication.updatedAt}
          </Text>
        ) : null}

        {hasActions ? (
          <Cluster as="footer" gap="sm" className={styles.actions}>
            {onOpen ? (
              <Button onClick={() => onOpen(publication.id)}>
                Open
              </Button>
            ) : null}

            {onDuplicate ? (
              <Button
                variant="secondary"
                onClick={() => onDuplicate(publication.id)}
              >
                Duplicate
              </Button>
            ) : null}

            {onDelete ? (
              <Button
                variant="ghost"
                onClick={() => onDelete(publication.id)}
              >
                Delete
              </Button>
            ) : null}
          </Cluster>
        ) : null}
      </Stack>
    </Card>
  )
}
