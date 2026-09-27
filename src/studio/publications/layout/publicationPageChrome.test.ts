import { describe, expect, it } from 'vitest'

import { getPublicationPageTemplateLabel } from './publicationPageChrome'

describe('getPublicationPageTemplateLabel', () => {
  it('maps semantic page templates to stable editorial running-header labels', () => {
    expect(getPublicationPageTemplateLabel('guided-framework')).toBe('Understanding')
    expect(getPublicationPageTemplateLabel('tool-overview')).toBe('Daily Tools')
    expect(getPublicationPageTemplateLabel('sensory-reset')).toBe('Sensory Reset')
    expect(getPublicationPageTemplateLabel('trigger-scan')).toBe('Triggers & Early Signs')
    expect(getPublicationPageTemplateLabel('regulation-menu')).toBe('Regulation Menu')
    expect(getPublicationPageTemplateLabel('nervous-system-basics')).toBe('Nervous System 101')
    expect(getPublicationPageTemplateLabel('deep-dive')).toBe('Deep Dive')
    expect(getPublicationPageTemplateLabel('goal-planner')).toBe('Goal Planner')
    expect(getPublicationPageTemplateLabel('emergency-tool')).toBe('Emergency Tool')
    expect(getPublicationPageTemplateLabel('daily-check-in')).toBe('Daily Check-In')
    expect(getPublicationPageTemplateLabel('planner-tracker')).toBe('Planning')
    expect(getPublicationPageTemplateLabel('closing')).toBe('Closing')
  })

  it('uses a neutral label when a content page has no explicit template', () => {
    expect(getPublicationPageTemplateLabel(undefined)).toBe('Journal Page')
  })
})
