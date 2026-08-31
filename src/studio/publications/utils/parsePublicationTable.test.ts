import { describe, expect, it } from 'vitest'

import { parsePublicationTable } from './parsePublicationTable'

describe('parsePublicationTable', () => {
  it('parses headers and rows from canonical Markdown tables', () => {
    expect(
      parsePublicationTable(
        '| Area | Current capacity |\n| --- | --- |\n| Physical | Low |\n| Mental | Medium |',
      ),
    ).toEqual({
      headers: ['Area', 'Current capacity'],
      rows: [
        ['Physical', 'Low'],
        ['Mental', 'Medium'],
      ],
    })
  })

  it('preserves escaped pipes inside cells', () => {
    expect(
      parsePublicationTable('| Pattern | Note |\n| --- | --- |\n| Work | Rest \\| recover |'),
    ).toEqual({
      headers: ['Pattern', 'Note'],
      rows: [['Work', 'Rest | recover']],
    })
  })
})
