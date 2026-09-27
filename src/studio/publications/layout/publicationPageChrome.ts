import type { PublicationPageTemplate } from '../types'

const LABEL_BY_TEMPLATE: Record<PublicationPageTemplate, string> = {
  navigation: 'Navigation',
  'section-opener': 'Section',
  'prompt-writing': 'Reflection',
  'daily-check-in': 'Daily Check-In',
  'guided-framework': 'Understanding',
  'tool-overview': 'Daily Tools',
  'sensory-reset': 'Sensory Reset',
  'emergency-tool': 'Emergency Tool',
  'weekly-reset': 'Weekly Reset',
  'planner-tracker': 'Planning',
  'matrix-framework': 'Framework',
  closing: 'Closing',
}

export function getPublicationPageTemplateLabel(
  pageTemplate: PublicationPageTemplate | undefined,
): string {
  return pageTemplate ? LABEL_BY_TEMPLATE[pageTemplate] : 'Journal Page'
}
