import { describe, expect, it } from 'vitest'

import type { PublicationBlock } from '../types'
import {
  getPublicationCompoundComponentAtIndex,
  inferPublicationCompoundComponents,
} from './publicationCompoundComponents'

describe('publication compound components', () => {
  it('recognizes a heading followed by a checkbox set as one checklist section', () => {
    const blocks: PublicationBlock[] = [
      { id: 'heading', type: 'heading', level: 2, text: 'Remembering' },
      { id: 'a', type: 'checkbox-field', text: 'I remember things at inconvenient times.' },
      { id: 'b', type: 'checkbox-field', text: 'I lose track after interruptions.' },
      { id: 'c', type: 'checkbox-field', text: 'I keep too much information in my head.' },
    ]

    expect(getPublicationCompoundComponentAtIndex(blocks, 0)).toMatchObject({
      kind: 'checklist-section',
      name: 'Remembering',
      blockIds: ['heading', 'a', 'b', 'c'],
    })
  })

  it('recognizes worksheet and guided-reflection sections', () => {
    const blocks: PublicationBlock[] = [
      { id: 'worksheet-heading', type: 'heading', level: 2, text: 'Life Dashboard' },
      {
        id: 'dashboard',
        type: 'table',
        text: '',
        columns: ['Area', 'Status'],
        rows: [['Work', '']],
      },
      { id: 'reflection-heading', type: 'heading', level: 2, text: 'Reflection' },
      {
        id: 'response',
        type: 'multiline-text-field',
        text: 'What would help?',
        responseSize: 'long',
      },
    ]

    expect(inferPublicationCompoundComponents(blocks).map((component) => component.kind)).toEqual([
      'worksheet-section',
      'guided-reflection',
    ])
  })

  it('keeps nested subheadings inside a higher-level compound tool until a peer section begins', () => {
    const blocks: PublicationBlock[] = [
      { id: 'weekly', type: 'heading', level: 2, text: 'Weekly Reset' },
      { id: 'intro', type: 'paragraph', text: 'Make the week visible.' },
      { id: 'step-1', type: 'heading', level: 3, text: 'Step 1' },
      {
        id: 'response-1',
        type: 'multiline-text-field',
        text: 'What are you trying not to forget?',
        responseSize: 'medium',
      },
      { id: 'step-2', type: 'heading', level: 3, text: 'Step 2' },
      {
        id: 'response-2',
        type: 'multiline-text-field',
        text: 'What is already scheduled?',
        responseSize: 'medium',
      },
      { id: 'next', type: 'heading', level: 2, text: 'Daily Compass' },
    ]

    expect(getPublicationCompoundComponentAtIndex(blocks, 0)).toMatchObject({
      kind: 'guided-reflection',
      name: 'Weekly Reset',
      blockIds: ['weekly', 'intro', 'step-1', 'response-1', 'step-2', 'response-2'],
    })
  })
})
