import type { PublicationBlock } from '../types'

export type PublicationPageArchetype =
  | 'empty'
  | 'section-opener'
  | 'reflection'
  | 'checklist'
  | 'worksheet'
  | 'content'

export function inferPublicationPageArchetype(
  blocks: readonly PublicationBlock[],
): PublicationPageArchetype {
  if (blocks.length === 0) return 'empty'

  if (blocks.some((block) => block.type === 'table')) {
    return 'worksheet'
  }

  const checkboxCount = blocks.filter((block) => block.type === 'checkbox-field').length
  if (checkboxCount >= 3 && checkboxCount >= Math.ceil(blocks.length / 2)) {
    return 'checklist'
  }

  const responseCount = blocks.filter((block) => block.type === 'multiline-text-field').length
  if (responseCount > 0 && responseCount >= Math.max(1, Math.floor(blocks.length / 3))) {
    return 'reflection'
  }

  const first = blocks[0]
  if (
    first?.type === 'heading' &&
    first.level === 1 &&
    blocks.length <= 3 &&
    blocks.every((block) => block.type === 'heading' || block.type === 'paragraph')
  ) {
    return 'section-opener'
  }

  return 'content'
}
