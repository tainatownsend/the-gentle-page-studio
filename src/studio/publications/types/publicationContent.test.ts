import { describe, expect, it } from 'vitest'

import type { PublicationBlock, PublicationContent } from './publicationContent'

describe('interactive publication block model', () => {
  it('keeps multiline and checkbox fields in the ordered content stream', () => {
    const blocks: PublicationBlock[] = [
      {
        id: 'heading-1',
        type: 'heading',
        level: 1,
        text: 'Reflect',
      },
      {
        id: 'field-1',
        type: 'multiline-text-field',
        text: 'What would support you today?',
      },
      {
        id: 'checkbox-1',
        type: 'checkbox-field',
        text: 'I completed this reflection.',
      },
    ]

    const content: PublicationContent = { blocks }

    expect(content.blocks.map((block) => block.type)).toEqual([
      'heading',
      'multiline-text-field',
      'checkbox-field',
    ])
  })
})
