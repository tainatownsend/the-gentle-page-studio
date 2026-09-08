import type { PublicationBlock } from '../types'
import {
  inferPublicationPageArchetype,
  type PublicationPageArchetype,
} from './publicationPageArchetypes'

export type PublicationPageDensity = 'spacious' | 'comfortable' | 'compact'

export type PublicationPageLayoutRecipe = {
  archetype: PublicationPageArchetype
  density: PublicationPageDensity
  preferWholePageTool: boolean
  preferBalancedWhitespace: boolean
}

const RECIPE_BY_ARCHETYPE: Record<PublicationPageArchetype, Omit<PublicationPageLayoutRecipe, 'archetype'>> = {
  empty: {
    density: 'spacious',
    preferWholePageTool: false,
    preferBalancedWhitespace: true,
  },
  'section-opener': {
    density: 'spacious',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  reflection: {
    density: 'comfortable',
    preferWholePageTool: false,
    preferBalancedWhitespace: true,
  },
  checklist: {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  worksheet: {
    density: 'compact',
    preferWholePageTool: true,
    preferBalancedWhitespace: false,
  },
  content: {
    density: 'comfortable',
    preferWholePageTool: false,
    preferBalancedWhitespace: true,
  },
}

export function getPublicationPageLayoutRecipe(
  blocks: readonly PublicationBlock[],
): PublicationPageLayoutRecipe {
  const archetype = inferPublicationPageArchetype(blocks)
  return {
    archetype,
    ...RECIPE_BY_ARCHETYPE[archetype],
  }
}
