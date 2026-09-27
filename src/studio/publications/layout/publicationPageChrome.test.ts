import { describe, expect, it } from 'vitest'

import { getPublicationPageTemplateLabel } from './publicationPageChrome'

describe('getPublicationPageTemplateLabel', () => {
  it('maps semantic page templates to stable editorial running-header labels', () => {
    expect(getPublicationPageTemplateLabel('guided-framework')).toBe('Understanding')
    expect(getPublicationPageTemplateLabel('emergency-tool')).toBe('Emergency Tool')
    expect(getPublicationPageTemplateLabel('daily-check-in')).toBe('Daily Check-In')
    expect(getPublicationPageTemplateLabel('planner-tracker')).toBe('Planning')
    expect(getPublicationPageTemplateLabel('closing')).toBe('Closing')
  })

  it('uses a neutral label when a content page has no explicit template', () => {
    expect(getPublicationPageTemplateLabel(undefined)).toBe('Journal Page')
  })
})
