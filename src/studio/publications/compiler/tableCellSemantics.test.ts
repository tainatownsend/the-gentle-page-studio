import { describe, expect, it } from 'vitest'

import {
  parsePublicationTableCell,
  tableCellHasInteractiveIntent,
  tableCellStaticText,
} from './tableCellSemantics'

describe('table cell semantics', () => {
  it('recognizes response directives without exposing protocol text', () => {
    expect(parsePublicationTableCell('[[GP:RESPONSE size="short"]]')).toEqual([
      { kind: 'response', size: 'short' },
    ])
    expect(tableCellStaticText('[[GP:RESPONSE size="short"]]')).toBe('')
    expect(tableCellHasInteractiveIntent('[[GP:RESPONSE size="short"]]')).toBe(true)
  })

  it('recognizes checkbox intent embedded in matrix cells', () => {
    expect(parsePublicationTableCell('- [ ] - [ ] - [ ]')).toEqual([
      { kind: 'checkbox' },
      { kind: 'checkbox' },
      { kind: 'checkbox' },
    ])
  })

  it('preserves ordinary cell copy around semantic controls', () => {
    expect(parsePublicationTableCell('Notes [[GP:RESPONSE size="medium"]]')).toEqual([
      { kind: 'text', text: 'Notes' },
      { kind: 'response', size: 'medium' },
    ])
    expect(tableCellStaticText('Notes [[GP:RESPONSE size="medium"]]')).toBe('Notes')
  })
})
