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

  it('normalizes real-product Markdown and HTML syntax across the shared publication model', () => {
    const result = compilePublicationManuscript(`# **The Steady Current**

**Offer Context Without Excuse:** Briefly explain the underlying overwhelm.

| Physiological Zone | Early Whisper |
| --- | --- |
| **Head & Face** | Clenched teeth<br><br>- [ ] Heavy eyelids<br> |`)

    expect(result.title).toBe('The Steady Current')

    const paragraph = result.content.blocks.find((block) => block.type === 'paragraph')
    expect(paragraph?.text).toBe(
      'Offer Context Without Excuse: Briefly explain the underlying overwhelm.',
    )

    const table = result.content.blocks.find((block) => block.type === 'table')
    expect(table?.type).toBe('table')
    if (table?.type !== 'table') return

    expect(table.rows[0]?.[0]).toBe('Head & Face')
    expect(table.rows[0]?.[1]).toBe('Clenched teeth Heavy eyelids')
    expect(table.cellControls?.[0]?.[1]).toEqual([{ kind: 'checkbox' }])

    const readerFacing = JSON.stringify(result.content)
    expect(readerFacing).not.toContain('<br')
    expect(readerFacing).not.toContain('**')
    expect(readerFacing).not.toContain('- [ ]')
  })

  it('recovers AI-authored multiline table cells that spill onto physical manuscript lines', () => {
    const result = compilePublicationManuscript(`# Somatic Signal Matrix

| Physiological Zone | Early Whisper | Escalating Signal | Full Flood |
| --- | --- | --- | --- |
| **Head & Face** | Clenched teeth<br>
<br>- [ ] Heavy eyelids<br>
<br>- [ ] Subtle headache | - [ ] Hot face<br>
<br>- [ ] Scalp tension<br>
<br>- [ ] Staring blankly | - [ ] Tunnel vision<br>
<br>- [ ] Auditory sensitivity<br>
<br>- [ ] Involuntary tears |`)

    const table = result.content.blocks.find((block) => block.type === 'table')
    expect(table?.type).toBe('table')
    if (table?.type !== 'table') return

    expect(result.content.blocks.filter((block) => block.type === 'paragraph')).toHaveLength(0)
    expect(table.rows[0]?.[0]).toBe('Head & Face')
    expect(table.rows[0]?.[1]).toContain('Clenched teeth')
    expect(table.rows[0]?.[1]).toContain('Heavy eyelids')
    expect(table.rows[0]?.[1]).toContain('Subtle headache')
    expect(table.rows[0]?.[2]).toContain('Hot face')
    expect(table.rows[0]?.[2]).toContain('Scalp tension')
    expect(table.rows[0]?.[2]).toContain('Staring blankly')
    expect(table.rows[0]?.[3]).toContain('Tunnel vision')
    expect(table.rows[0]?.[3]).toContain('Auditory sensitivity')
    expect(table.rows[0]?.[3]).toContain('Involuntary tears')

    const readerFacing = JSON.stringify(result.content)
    expect(readerFacing).not.toContain('<br')
    expect(readerFacing).not.toContain('**')
    expect(readerFacing).not.toContain('- [ ]')
  })
})
