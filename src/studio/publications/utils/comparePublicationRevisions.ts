import type { PublicationBlock, PublicationRevision } from '../types'

export type PublicationRevisionChange =
  | {
      kind: 'metadata'
      field: 'title' | 'description'
      before?: string
      after?: string
    }
  | {
      kind: 'block-added'
      blockId: string
      after: PublicationBlock
      afterIndex: number
    }
  | {
      kind: 'block-removed'
      blockId: string
      before: PublicationBlock
      beforeIndex: number
    }
  | {
      kind: 'block-changed'
      blockId: string
      before: PublicationBlock
      after: PublicationBlock
      beforeIndex: number
      afterIndex: number
    }
  | {
      kind: 'block-moved'
      blockId: string
      beforeIndex: number
      afterIndex: number
    }

export type PublicationRevisionComparison = {
  fromRevisionId: string
  toRevisionId: string
  hasChanges: boolean
  changes: PublicationRevisionChange[]
}

function blocksEqual(left: PublicationBlock, right: PublicationBlock): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function comparePublicationRevisions(
  from: PublicationRevision,
  to: PublicationRevision,
): PublicationRevisionComparison {
  const changes: PublicationRevisionChange[] = []

  if (from.title !== to.title) {
    changes.push({
      kind: 'metadata',
      field: 'title',
      before: from.title,
      after: to.title,
    })
  }

  if ((from.description ?? '') !== (to.description ?? '')) {
    changes.push({
      kind: 'metadata',
      field: 'description',
      before: from.description,
      after: to.description,
    })
  }

  const fromById = new Map(
    from.content.blocks.map((block, index) => [block.id, { block, index }]),
  )
  const toById = new Map(
    to.content.blocks.map((block, index) => [block.id, { block, index }]),
  )

  for (const [blockId, { block, index }] of fromById) {
    const next = toById.get(blockId)

    if (!next) {
      changes.push({
        kind: 'block-removed',
        blockId,
        before: block,
        beforeIndex: index,
      })
      continue
    }

    if (!blocksEqual(block, next.block)) {
      changes.push({
        kind: 'block-changed',
        blockId,
        before: block,
        after: next.block,
        beforeIndex: index,
        afterIndex: next.index,
      })
    }

    if (index !== next.index) {
      changes.push({
        kind: 'block-moved',
        blockId,
        beforeIndex: index,
        afterIndex: next.index,
      })
    }
  }

  for (const [blockId, { block, index }] of toById) {
    if (!fromById.has(blockId)) {
      changes.push({
        kind: 'block-added',
        blockId,
        after: block,
        afterIndex: index,
      })
    }
  }

  return {
    fromRevisionId: from.id,
    toRevisionId: to.id,
    hasChanges: changes.length > 0,
    changes,
  }
}
