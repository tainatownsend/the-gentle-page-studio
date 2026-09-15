import { describe, expect, it } from 'vitest'

import type { PublicationBlock } from '../types'
import { inferPublicationPageArchetype } from './publicationPageArchetypes'

describe('inferPublicationPageArchetype', () => {
  it('recognizes section openers', () => {
    const blocks: PublicationBlock[] = [
      { id: 'section', type: 'heading', level: 1, text: 'Part Four: Monthly Planning' },
      { id: 'intro', type: 'paragraph', text: 'Reset gently and choose what matters.' },
    ]

    expect(inferPublicationPageArchetype(blocks)).toBe('section-opener')
  })

  it('recognizes checklist-heavy pages', () => {
    const blocks: PublicationBlock[] = Array.from({ length: 5 }, (_, index) => ({
      id: `check-${index}`,
      type: 'checkbox-field' as const,
      text: `Option ${index + 1}`,
    }))

    expect(inferPublicationPageArchetype(blocks)).toBe('checklist')
  })

  it('recognizes reflection pages', () => {
    const blocks: PublicationBlock[] = [
      { id: 'heading', type: 'heading', level: 2, text: 'Reflection' },
      {
        id: 'response',
        type: 'multiline-text-field',
        text: 'What would make this easier?',
        responseSize: 'long',
      },
    ]

    expect(inferPublicationPageArchetype(blocks)).toBe('reflection')
  })

  it('prioritizes worksheets when a table is present', () => {
    const blocks: PublicationBlock[] = [
      {
        id: 'table',
        type: 'table',
        text: 'Life dashboard',
        columns: ['Area', 'How is this going?'],
        rows: [['Work', '']],
      },
    ]

    expect(inferPublicationPageArchetype(blocks)).toBe('worksheet')
  })
})
