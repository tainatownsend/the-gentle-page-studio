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
})
