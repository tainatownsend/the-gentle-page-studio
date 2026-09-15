import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from './compilePublicationManuscript'

describe('compilePublicationManuscript', () => {
  it('removes response directives from structured table cells while preserving field intent', () => {
    const result = compilePublicationManuscript(`# Life dashboard

| Area | How is this going? | Needs attention soon? |
| --- | --- | --- |
| Work | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Home | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |`)

    const table = result.content.blocks.find((block) => block.type === 'table')

    expect(table?.type).toBe('table')
    if (table?.type !== 'table') return

    expect(table.rows).toEqual([
      ['Work', '', ''],
      ['Home', '', ''],
    ])
    expect(table.cellControls).toEqual([
      [[], [{ kind: 'response', size: 'short' }], [{ kind: 'response', size: 'short' }]],
      [[], [{ kind: 'response', size: 'short' }], [{ kind: 'response', size: 'short' }]],
    ])
    expect(JSON.stringify(table)).not.toContain('[[GP:RESPONSE')
  })

  it('converts checkbox directives inside table cells to semantic controls', () => {
    const result = compilePublicationManuscript(`# Energy matrix

| Activity | Gives | Neutral | Takes |
| --- | --- | --- | --- |
| Example | - [ ] | - [ ] | - [ ] |`)

    const table = result.content.blocks.find((block) => block.type === 'table')

    expect(table?.type).toBe('table')
    if (table?.type !== 'table') return

    expect(table.rows[0]).toEqual(['Example', '', '', ''])
    expect(table.cellControls?.[0]).toEqual([
      [],
      [{ kind: 'checkbox' }],
      [{ kind: 'checkbox' }],
      [{ kind: 'checkbox' }],
    ])
  })
})
