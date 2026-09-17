import type { PublicationBlock } from '../types'
import { inferPublicationPageArchetype } from './publicationPageArchetypes'

export type PublicationSelfHealingOptions = {
  capacityUnits: number
  estimateUnits: (block: PublicationBlock) => number
}

function pageUnits(
  blocks: readonly PublicationBlock[],
  estimateUnits: PublicationSelfHealingOptions['estimateUnits'],
): number {
  return blocks.reduce((total, block) => total + estimateUnits(block), 0)
}

function hasRepeatableContent(blocks: readonly PublicationBlock[]): boolean {
  return blocks.some((block) => block.semanticGroup?.kind === 'repeatable-page')
}

function hasForcedBoundary(blocks: readonly PublicationBlock[]): boolean {
  return blocks[0]?.layout?.pageBreakBefore === 'forced'
}

function canMergeStrandedHeading(
  current: readonly PublicationBlock[],
  next: readonly PublicationBlock[],
  options: PublicationSelfHealingOptions,
): boolean {
  if (current.length !== 1 || next.length === 0) return false

  const heading = current[0]
  if (heading?.type !== 'heading' || heading.level === 1) return false

  // A forced break on the stranded heading means “start this section on a new page”.
  // Moving that heading forward with the content it introduces preserves the authored
  // boundary because the heading remains the first block on the resulting page. A forced
  // break on the next page, however, represents a separate authored boundary and must stay.
  if (hasForcedBoundary(next)) return false
  if (hasRepeatableContent(current) || hasRepeatableContent(next)) return false
  if (inferPublicationPageArchetype(current) === 'section-opener') return false

  return pageUnits([...current, ...next], options.estimateUnits) <= options.capacityUnits
}

export function healPublicationPages(
  pages: readonly PublicationBlock[][],
  options: PublicationSelfHealingOptions,
): PublicationBlock[][] {
  const healed = pages.map((page) => [...page])

  for (let index = 0; index < healed.length - 1; index += 1) {
    const current = healed[index]
    const next = healed[index + 1]
    if (!current || !next) continue

    if (canMergeStrandedHeading(current, next, options)) {
      next.unshift(...current)
      current.splice(0, current.length)
    }
  }

  return healed.filter((page, index) => page.length > 0 || (healed.length === 1 && index === 0))
}
