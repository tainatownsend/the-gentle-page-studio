import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from '../compiler'
import { generateFillablePublicationPdf } from '../export'
import { createPublicationLayout } from '../layout'
import { createPublicationFixture } from './createPublicationFixture'

const BRAIN_FRIENDLY_PLANNER_MANUSCRIPT = `# The Brain-Friendly Planner

A gentle planning system for working with attention, energy, memory, and real-life capacity.

## Part One: Build Your Brain-Friendly System

Notice what tends to make life harder without judging yourself for it.

### Remembering

- [ ] I remember things at inconvenient times.
- [ ] If I cannot see something, I may forget it exists.
- [ ] I lose track of appointments or deadlines.
- [ ] I create reminders and then stop noticing them.
- [ ] I forget what I was doing after an interruption.

### Prioritizing

- [ ] Everything feels important.
- [ ] Everything feels urgent.
- [ ] I choose easy tasks instead of important ones.
- [ ] I struggle to decide what to do first.
- [ ] I spend too long deciding.

## Weekly Reset

Use this reset to make the week visible before deciding what deserves your energy.

### Step 1: Empty your brain

What are you currently trying not to forget?

[[GP:RESPONSE size="medium"]]

### Step 2: Look ahead

What already has a time or deadline?

[[GP:RESPONSE size="medium"]]

### Step 3: Choose your Big Three

What three outcomes do you most want to protect?

[[GP:RESPONSE size="medium"]]

### Step 4: Notice your capacity

[[GP:RATING min="0" max="10"]]

### Step 5: Make the week easier

What can you prepare, automate, delegate, cancel, simplify, or decide in advance?

[[GP:RESPONSE size="medium"]]

## Daily Compass

### How much capacity do I have today?

[[GP:RATING min="0" max="10"]]

### My brain feels...

- [ ] Clear
- [ ] Busy
- [ ] Restless
- [ ] Distracted
- [ ] Tired

### The One Thing

If I only move one meaningful thing forward today, let it be:

[[GP:RESPONSE size="medium"]]

## Life Dashboard

| Area | How is this going? | Needs attention soon? |
| --- | --- | --- |
| Work / study | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Home | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Health / body needs | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |

## What Gives and Takes Energy?

| Activity / situation | Usually gives energy | Neutral | Usually takes energy |
| --- | --- | --- | --- |
| Morning routine | - [ ] | - [ ] | - [ ] |
| Meetings | - [ ] | - [ ] | - [ ] |
| Errands | - [ ] | - [ ] | - [ ] |
`

function createGoldenPublication() {
  const compiled = compilePublicationManuscript(BRAIN_FRIENDLY_PLANNER_MANUSCRIPT)

  return {
    compiled,
    publication: createPublicationFixture({
      id: 'brain-friendly-planner-golden',
      title: compiled.title,
      description: 'A gentle planning system for attention, energy, memory, and real-life capacity.',
      content: compiled.content,
    }),
  }
}

describe('Brain-Friendly Planner golden acceptance', () => {
  it('compiles the real failure patterns without source syntax or stranded headings', () => {
    const { compiled, publication } = createGoldenPublication()
    const serialized = JSON.stringify(compiled.content)
    const layout = createPublicationLayout(publication)
    const contentPages = layout.pages.filter((page) => page.kind === 'content')

    expect(serialized).not.toContain('[[GP:')
    expect(serialized).not.toContain('- [ ]')
    expect(
      layout.diagnostics.some((diagnostic) => diagnostic.code === 'protocol-syntax-leak'),
    ).toBe(false)
    expect(
      layout.diagnostics.some((diagnostic) => diagnostic.code === 'heading-only-page'),
    ).toBe(false)
    expect(contentPages.every((page) => !(page.blocks.length === 1 && page.blocks[0]?.type === 'heading'))).toBe(true)
    expect(contentPages.length).toBeLessThan(14)
    expect(layout.qualityScore).toBeGreaterThanOrEqual(80)
  })

  it('preserves table writing and checkbox intent as semantic controls', () => {
    const { compiled } = createGoldenPublication()
    const tables = compiled.content.blocks.filter((block) => block.type === 'table')

    expect(tables).toHaveLength(2)
    expect(tables[0]?.type).toBe('table')
    expect(tables[1]?.type).toBe('table')

    if (tables[0]?.type !== 'table' || tables[1]?.type !== 'table') return

    expect(tables[0].cellControls?.flat(2).filter((control) => control.kind === 'response')).toHaveLength(6)
    expect(tables[1].cellControls?.flat(2).filter((control) => control.kind === 'checkbox')).toHaveLength(9)
  })

  it('exports the golden planner with real AcroForm fields, including structured table cells', async () => {
    const { publication } = createGoldenPublication()
    const bytes = await generateFillablePublicationPdf(publication)
    const document = await PDFDocument.load(bytes)
    const fields = document.getForm().getFields()
    const fieldNames = fields.map((field) => field.getName())

    expect(bytes.byteLength).toBeGreaterThan(1000)
    expect(fields.length).toBeGreaterThan(10)
    expect(fieldNames.some((name) => name.includes('.cell.'))).toBe(true)
    expect(fieldNames.some((name) => name.includes('brain-friendly-planner-golden'))).toBe(true)
  })
})
