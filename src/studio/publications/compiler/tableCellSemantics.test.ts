import { describe, expect, it } from 'vitest'

import {
  normalizeReaderFacingText,
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

  it('removes authoring-only HTML breaks and Markdown emphasis from reader-facing text', () => {
    expect(normalizeReaderFacingText('**Head & Face**<br><br>Clenched teeth')).toBe(
      'Head & Face\nClenched teeth',
    )
    expect(normalizeReaderFacingText('**1. The Behavior**')).toBe('1. The Behavior')
  })

  it('does not leak break tags around checkbox controls', () => {
    expect(parsePublicationTableCell('Clenched teeth<br><br>- [ ] Heavy eyelids<br>')).toEqual([
      { kind: 'text', text: 'Clenched teeth' },
      { kind: 'checkbox' },
      { kind: 'text', text: 'Heavy eyelids' },
    ])

    expect(tableCellStaticText('Clenched teeth<br><br>- [ ] Heavy eyelids<br>')).toBe(
      'Clenched teeth Heavy eyelids',
    )
  })
})
