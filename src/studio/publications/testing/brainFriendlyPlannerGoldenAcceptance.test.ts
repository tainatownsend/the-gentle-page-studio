import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from '../compiler'
import { generateFillablePublicationPdf } from '../export/generateFillablePublicationPdf'
import { createPublicationLayout } from '../layout'
import { createPublicationFixture } from './createPublicationFixture'

const BRAIN_FRIENDLY_PLANNER_MANUSCRIPT = `# The Brain-Friendly Planner

A gentle planning system for making attention, energy, memory, and real-life capacity visible before deciding what to do next.

[[GP:AUTHOR_NOTE]]
Keep this publication calm, practical, gender-neutral, and low-shame. Do not expose this note to the reader.
[[GP:END]]

## Start With Your Brain, Not an Ideal Week

Planning works better when the system reflects how your attention and energy actually behave.

### What tends to make planning harder?

- [ ] I remember things at inconvenient times.
- [ ] If I cannot see something, I may forget it exists.
- [ ] Everything can feel equally important.
- [ ] I underestimate how long transitions take.
- [ ] Interruptions make it hard to resume.
- [ ] A full list can make me freeze instead of start.

### What already helps?

What tools, routines, people, environments, or reminders make follow-through easier?

[[GP:RESPONSE size="medium"]]

## Weekly Reset

Use this reset to make the week visible before deciding what deserves your energy.

### Step 1: Empty your brain

What are you currently trying not to forget?

[[GP:RESPONSE size="medium"]]

### Step 2: Look ahead

What already has a time, deadline, appointment, or dependency?

[[GP:RESPONSE size="medium"]]

### Step 3: Choose your Big Three

What three outcomes matter most if the week becomes busier than expected?

[[GP:RESPONSE size="medium"]]

### Step 4: Notice your capacity

How much realistic capacity do you have for this week?

[[GP:RATING min="0" max="10"]]

### Step 5: Lower the friction

What can you prepare, automate, delegate, cancel, simplify, move, or decide in advance?

[[GP:RESPONSE size="medium"]]

[[GP:PAGE_BREAK type="preferred"]]

[[GP:REPEATABLE_PAGE name="Daily Compass"]]

## Daily Compass

A short check-in for choosing what fits today instead of forcing yesterday's plan.

### Capacity right now

[[GP:RATING min="0" max="10"]]

### My brain feels...

- [ ] Clear
- [ ] Busy
- [ ] Restless
- [ ] Distracted
- [ ] Tired
- [ ] Overloaded

### The One Thing

If I only move one meaningful thing forward today, let it be:

[[GP:RESPONSE size="medium"]]

### Make starting easier

What is the smallest visible next step?

[[GP:RESPONSE size="short"]]

What support or setup would reduce friction?

[[GP:RESPONSE size="short"]]

[[GP:END_REPEATABLE_PAGE]]

## Life Dashboard

Use this as a scan, not a scorecard. Notice where attention may be useful.

| Area | How is this going? | Needs attention soon? |
| --- | --- | --- |
| Work / study | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Home | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Health / body needs | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Relationships | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Money / admin | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |

## Energy Pattern Matrix

Mark the pattern that feels most typical right now.

| Activity / situation | Usually gives energy | Neutral | Usually takes energy |
| --- | --- | --- | --- |
| Morning routine | - [ ] | - [ ] | - [ ] |
| Focused work | - [ ] | - [ ] | - [ ] |
| Meetings / conversations | - [ ] | - [ ] | - [ ] |
| Errands | - [ ] | - [ ] | - [ ] |
| Housework | - [ ] | - [ ] | - [ ] |

## Friction-to-Support Plan

Turn recurring friction into an experiment instead of a character judgment.

| Friction I notice | What might be contributing? | One support to try |
| --- | --- | --- | --- |
| [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |

## End-of-Week Reflection

### What worked better than expected?

[[GP:RESPONSE size="medium"]]

### What created avoidable friction?

[[GP:RESPONSE size="medium"]]

### What do I want to carry into next week?

[[GP:RESPONSE size="medium"]]
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
    expect(
      layout.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'sparse-page' ||
          diagnostic.code === 'severe-underutilization',
      ),
    ).toBe(false)
    expect(layout.health).toBe('healthy')
    expect(contentPages.length).toBeLessThanOrEqual(13)
    expect(layout.qualityScore).toBeGreaterThanOrEqual(80)

    const pageForBlock = (blockId: string) =>
      contentPages.find((page) => page.blocks.some((block) => block.id === blockId))?.pageNumber
    const headingByText = (text: string) =>
      compiled.content.blocks.find((block) => block.type === 'heading' && block.text === text)
    const tables = compiled.content.blocks.filter((block) => block.type === 'table')
    const lifeHeading = headingByText('Life Dashboard')
    const energyHeading = headingByText('Energy Pattern Matrix')
    const brainFeelsHeading = headingByText('My brain feels...')
    const brainFeelsIndex = compiled.content.blocks.findIndex(
      (block) => block.id === brainFeelsHeading?.id,
    )
    const brainFeelsCheckboxes = compiled.content.blocks
      .slice(brainFeelsIndex + 1, brainFeelsIndex + 7)
      .filter((block) => block.type === 'checkbox-field')

    expect(lifeHeading).toBeDefined()
    expect(energyHeading).toBeDefined()
    expect(tables).toHaveLength(3)
    expect(pageForBlock(lifeHeading?.id ?? '')).toBe(pageForBlock(tables[0]?.id ?? ''))
    expect(pageForBlock(energyHeading?.id ?? '')).toBe(pageForBlock(tables[1]?.id ?? ''))
    expect(brainFeelsCheckboxes).toHaveLength(6)
    expect(
      new Set([
        pageForBlock(brainFeelsHeading?.id ?? ''),
        ...brainFeelsCheckboxes.map((block) => pageForBlock(block.id)),
      ]).size,
    ).toBe(1)
  })

  it('preserves table writing and checkbox intent as semantic controls', () => {
    const { compiled } = createGoldenPublication()
    const tables = compiled.content.blocks.filter((block) => block.type === 'table')

    expect(tables).toHaveLength(3)
    expect(tables[0]?.type).toBe('table')
    expect(tables[1]?.type).toBe('table')
    expect(tables[2]?.type).toBe('table')

    if (
      tables[0]?.type !== 'table' ||
      tables[1]?.type !== 'table' ||
      tables[2]?.type !== 'table'
    ) return

    expect(tables[0].cellControls?.flat(2).filter((control) => control.kind === 'response')).toHaveLength(10)
    expect(tables[1].cellControls?.flat(2).filter((control) => control.kind === 'checkbox')).toHaveLength(15)
    expect(tables[2].cellControls?.flat(2).filter((control) => control.kind === 'response')).toHaveLength(9)
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
