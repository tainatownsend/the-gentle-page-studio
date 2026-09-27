import type { PublicationBlock, PublicationPageTemplate } from '../types'
import {
  inferPublicationPageArchetype,
  type PublicationPageArchetype,
} from './publicationPageArchetypes'

export type PublicationPageDensity = 'spacious' | 'comfortable' | 'compact'

export type PublicationPageLayoutRecipe = {
  archetype: PublicationPageArchetype
  pageTemplate?: PublicationPageTemplate
  density: PublicationPageDensity
  preferWholePageTool: boolean
  preferBalancedWhitespace: boolean
}

const RECIPE_BY_ARCHETYPE: Record<
  PublicationPageArchetype,
  Omit<PublicationPageLayoutRecipe, 'archetype' | 'pageTemplate'>
> = {
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
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  content: {
    density: 'comfortable',
    preferWholePageTool: false,
    preferBalancedWhitespace: true,
  },
}



const RECIPE_BY_TEMPLATE: Record<
  PublicationPageTemplate,
  Omit<PublicationPageLayoutRecipe, 'archetype' | 'pageTemplate'>
> = {
  navigation: {
    density: 'spacious',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'section-opener': {
    density: 'spacious',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'prompt-writing': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'daily-check-in': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'guided-framework': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'emergency-tool': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'weekly-reset': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'planner-tracker': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  'matrix-framework': {
    density: 'comfortable',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
  closing: {
    density: 'spacious',
    preferWholePageTool: true,
    preferBalancedWhitespace: true,
  },
}

export function getPublicationPageLayoutRecipe(
  blocks: readonly PublicationBlock[],
): PublicationPageLayoutRecipe {
  const archetype = inferPublicationPageArchetype(blocks)
  const pageTemplate = blocks.find((block) => block.layout?.pageTemplate)?.layout
    ?.pageTemplate

  return {
    archetype,
    pageTemplate,
    ...(pageTemplate ? RECIPE_BY_TEMPLATE[pageTemplate] : RECIPE_BY_ARCHETYPE[archetype]),
  }
}
