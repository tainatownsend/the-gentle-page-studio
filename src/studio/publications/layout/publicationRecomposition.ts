import type { PublicationBlock } from '../types'
import { getPublicationCompoundComponentAtIndex } from './publicationCompoundComponents'

export type PublicationRecompositionOptions = {
  capacityUnits: number
  minimumBalancedPageUnits: number
  estimateUnits: (block: PublicationBlock) => number
}

function pageUnits(
  page: readonly PublicationBlock[],
  estimateUnits: PublicationRecompositionOptions['estimateUnits'],
): number {
  return page.reduce((total, block) => total + estimateUnits(block), 0)
}

function hasRepeatableBoundary(blocks: readonly PublicationBlock[]): boolean {
  return blocks.some((block) => block.semanticGroup?.kind === 'repeatable-page')
}

function getMovableSuffixStart(page: readonly PublicationBlock[]): number {
  if (page.length === 0) return 0

  let start = page.length - 1
  const last = page[start]

  if (last?.type === 'checkbox-field') {
    while (start > 0 && page[start - 1]?.type === 'checkbox-field') {
      start -= 1
    }

    const possibleHeadingIndex = start - 1
    const component =
      possibleHeadingIndex >= 0
        ? getPublicationCompoundComponentAtIndex(page, possibleHeadingIndex)
        : undefined

    if (component?.endIndex === page.length) {
      return possibleHeadingIndex
    }

    return start
  }

  const previousIndex = page.length - 2
  if (previousIndex >= 0 && page[previousIndex]?.type === 'heading') {
    const component = getPublicationCompoundComponentAtIndex(page, previousIndex)
    if (component?.endIndex === page.length) {
      return previousIndex
    }

    return previousIndex
  }

  return start
}

function balancePair(
  current: PublicationBlock[],
  next: PublicationBlock[],
  options: PublicationRecompositionOptions,
): boolean {
  if (current.length === 0 || next.length === 0) return false
  if (hasRepeatableBoundary(current) || hasRepeatableBoundary(next)) return false

  const nextFirst = next[0]
  if (nextFirst?.layout?.pageBreakBefore) return false

  const suffixStart = getMovableSuffixStart(current)
  const suffix = current.slice(suffixStart)
  if (suffix.length === 0) return false

  const currentUnits = pageUnits(current, options.estimateUnits)
  const nextUnits = pageUnits(next, options.estimateUnits)
  const suffixUnits = pageUnits(suffix, options.estimateUnits)
  const rebalancedCurrentUnits = currentUnits - suffixUnits
  const rebalancedNextUnits = nextUnits + suffixUnits

  if (rebalancedNextUnits > options.capacityUnits) return false
  if (rebalancedCurrentUnits < options.minimumBalancedPageUnits) return false

  const beforeDifference = Math.abs(currentUnits - nextUnits)
  const afterDifference = Math.abs(rebalancedCurrentUnits - rebalancedNextUnits)

  if (afterDifference >= beforeDifference) return false

  current.splice(suffixStart, suffix.length)
  next.unshift(...suffix)
  return true
}

export function recomposePublicationPages(
  pages: readonly PublicationBlock[][],
  options: PublicationRecompositionOptions,
): PublicationBlock[][] {
  const recomposed = pages.map((page) => [...page])

  for (let index = 0; index < recomposed.length - 1; index += 1) {
    const current = recomposed[index]
    const next = recomposed[index + 1]
    if (!current || !next) continue

    balancePair(current, next, options)
  }

  return recomposed.filter((page) => page.length > 0 || recomposed.length === 1)
}
