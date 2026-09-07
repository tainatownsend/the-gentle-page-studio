import { describe, expect, it } from 'vitest'

import { GENTLE_PAGE_AI_AUTHORING_PROMPT } from './gentlePageAiAuthoringPrompt'

describe('GENTLE_PAGE_AI_AUTHORING_PROMPT', () => {
  it('teaches AI tools to preserve compound journal structure', () => {
    expect(GENTLE_PAGE_AI_AUTHORING_PROMPT).toContain('Keep one conceptual tool together')
    expect(GENTLE_PAGE_AI_AUTHORING_PROMPT).toContain('Do not put a page break before every heading')
    expect(GENTLE_PAGE_AI_AUTHORING_PROMPT).toContain('Use - [ ] Option for every selectable checklist')
    expect(GENTLE_PAGE_AI_AUTHORING_PROMPT).toContain('Place the response directive immediately after the prompt')
  })
})
