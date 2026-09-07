import type { PublicationBlock } from '../types'

export type PublicationCompoundComponentKind =
  | 'checklist-section'
  | 'worksheet-section'
  | 'guided-reflection'
  | 'rating-section'

export type PublicationCompoundComponent = {
  kind: PublicationCompoundComponentKind
  name: string
  startIndex: number
  endIndex: number
  blockIds: string[]
}

function classifyCompoundChildren(
  children: readonly PublicationBlock[],
): PublicationCompoundComponentKind | undefined {
  if (children.some((block) => block.type === 'table')) {
    return 'worksheet-section'
  }

  const checkboxCount = children.filter((block) => block.type === 'checkbox-field').length
  if (checkboxCount >= 3 && checkboxCount >= Math.ceil(children.length / 2)) {
    return 'checklist-section'
  }

  const responseCount = children.filter((block) => block.type === 'multiline-text-field').length
  if (responseCount > 0) {
    return 'guided-reflection'
  }

  const ratingCount = children.filter((block) => block.type === 'rating-field').length
  if (ratingCount > 0) {
    return 'rating-section'
  }

  return undefined
}

function crossesRepeatableSemanticBoundary(
  heading: PublicationBlock,
  candidate: PublicationBlock,
): boolean {
  const headingGroup = heading.semanticGroup
  const candidateGroup = candidate.semanticGroup
  const headingRepeatableId =
    headingGroup?.kind === 'repeatable-page' ? headingGroup.id : undefined
  const candidateRepeatableId =
    candidateGroup?.kind === 'repeatable-page' ? candidateGroup.id : undefined

  return (
    headingRepeatableId !== candidateRepeatableId &&
    (headingRepeatableId !== undefined || candidateRepeatableId !== undefined)
  )
}

export function getPublicationCompoundComponentAtIndex(
  blocks: readonly PublicationBlock[],
  startIndex: number,
): PublicationCompoundComponent | undefined {
  const heading = blocks[startIndex]
  if (heading?.type !== 'heading') return undefined

  let endIndex = startIndex + 1
  while (endIndex < blocks.length && blocks[endIndex]?.type !== 'heading') {
    const candidate = blocks[endIndex]
    if (!candidate || crossesRepeatableSemanticBoundary(heading, candidate)) break
    endIndex += 1
  }

  const children = blocks.slice(startIndex + 1, endIndex)
  if (children.length === 0) return undefined

  const kind = classifyCompoundChildren(children)
  if (!kind) return undefined

  return {
    kind,
    name: heading.text,
    startIndex,
    endIndex,
    blockIds: blocks.slice(startIndex, endIndex).map((block) => block.id),
  }
}

export function inferPublicationCompoundComponents(
  blocks: readonly PublicationBlock[],
): PublicationCompoundComponent[] {
  const components: PublicationCompoundComponent[] = []

  for (let index = 0; index < blocks.length; index += 1) {
    const component = getPublicationCompoundComponentAtIndex(blocks, index)
    if (component) components.push(component)
  }

  return components
}
