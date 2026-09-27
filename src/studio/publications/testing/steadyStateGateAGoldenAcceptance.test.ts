import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from '../compiler'
import { generateFillablePublicationPdf } from '../export/generateFillablePublicationPdf'
import { createPublicationLayout } from '../layout'
import { createPublicationFixture } from './createPublicationFixture'

const STEADY_STATE_GATE_A_MANUSCRIPT = `# The Steady State

An ADHD Regulation Journal & Toolkit

[[GP:PAGE_TEMPLATE type="guided-framework"]]

## Understanding Your Nervous System State

Regulation is not about staying perfectly calm or relentlessly productive. It is about learning to recognize where your nervous system is, removing moral judgment from your energy levels, and applying the lowest-friction intervention needed to shift states.

### The 4-State Self-Scan

Choose the description that feels closest to your current state.

- [ ] HYPERAROUSAL · OVERWHELMED / FRANTIC — Racing thoughts, sensory sensitivity, physical tension, irritability, task-hopping without finishing.
- [ ] HYPOAROUSAL · FREEZE / SHUTDOWN — Heavy body, paralysis, brain fog, apathy, scrolling loop, difficulty initiating any movement.
- [ ] UNDERAROUSED · DOPAMINE-STARVED / RESTLESS — Boredom that feels physically uncomfortable, seeking high-stimulation snacks/screens, fidgeting, unable to focus on low-urgency tasks.
- [ ] REGULATED WINDOW · ENGAGED / GROUNDED — Present, capable of sequential thought, flexible, able to start and stop tasks with manageable effort.

### CURRENT SENSATION AUDIT: What is your body physically feeling right now?

[[GP:RESPONSE size="long"]]

[[GP:PAGE_TEMPLATE type="emergency-tool"]]

## The Emergency Unfreeze Protocol

Use this single-page tool when you are stuck in an executive dysfunction freeze, executive paralysis, or an involuntary scrolling loop. Do not try to complete your actual to-do list yet; your only goal is physical disengagement.

### STEP 1 PHYSIOLOGICAL INTERRUPT

- [ ] Drink a glass of cold water or splash cold water on your face.
- [ ] Change physical posture: stand up, shake hands out, or lie flat on the floor for 60 seconds.
- [ ] Sensory shift: change lighting, put on noise-canceling headphones, or take off tight clothing.

### STEP 2 FRICTION REDUCTION

- [ ] Initiation friction: The task feels too big or ambiguous.
- [ ] Sensory friction: The environment is too loud, messy, or uncomfortable.
- [ ] Emotional friction: Fear of doing it poorly, rejection sensitivity, or shame.
- [ ] Physical deficit: Dehydrated, hungry, needing movement, or exhausted.

### STEP 3 THE MICRO-SLICE · THE SMALLEST NON-THREATENING ACTION

Define an action so small it requires zero motivation (e.g., "Open the document and write the title"):

[[GP:RESPONSE size="long"]]

[[GP:PAGE_TEMPLATE type="daily-check-in"]]

## Daily Nervous System Check-in

### Date & Time

[[GP:RESPONSE size="short"]]

### Baseline Energy

[[GP:RATING min="0" max="10"]]

### Executive Function Capacity

[[GP:RATING min="0" max="10"]]

### SENSORY & BODY INVENTORY

- [ ] High sound sensitivity
- [ ] Screen fatigue
- [ ] Physical restlessness / muscle tightness
- [ ] Skipped meals / irregular hydration
- [ ] Low social battery

### A NOTE TO MYSELF

[[GP:RESPONSE size="long"]]
`

function createGateAPublication() {
  const compiled = compilePublicationManuscript(STEADY_STATE_GATE_A_MANUSCRIPT)

  return {
    compiled,
    publication: createPublicationFixture({
      id: 'steady-state-gate-a',
      title: compiled.title,
      description: 'An ADHD Regulation Journal & Toolkit',
      content: compiled.content,
    }),
  }
}

describe('The Steady State Gate A golden acceptance', () => {
  it('keeps the three canonical tool families on three dedicated content pages', () => {
    const { compiled, publication } = createGateAPublication()
    const layout = createPublicationLayout(publication)
    const contentPages = layout.pages.filter((page) => page.kind === 'content')
    const serialized = JSON.stringify(compiled.content)

    expect(serialized).not.toContain('[[GP:')
    expect(serialized).not.toContain('- [ ]')
    expect(contentPages).toHaveLength(3)
    expect(contentPages.map((page) => page.pageTemplate)).toEqual([
      'guided-framework',
      'emergency-tool',
      'daily-check-in',
    ])
    expect(
      layout.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'protocol-syntax-leak' ||
          diagnostic.code === 'heading-only-page' ||
          diagnostic.code === 'fragmented-compound-component',
      ),
    ).toBe(false)
    expect(layout.qualityScore).toBeGreaterThanOrEqual(80)
  })

  it('keeps the Emergency Unfreeze Protocol as one page', () => {
    const { publication } = createGateAPublication()
    const emergencyPages = createPublicationLayout(publication).pages.filter(
      (page) => page.pageTemplate === 'emergency-tool',
    )

    expect(emergencyPages).toHaveLength(1)
    expect(
      emergencyPages[0]?.blocks.some(
        (block) =>
          block.type === 'heading' &&
          block.text.includes('STEP 3 THE MICRO-SLICE'),
      ),
    ).toBe(true)
  })

  it('exports real fillable controls for the canonical Gate A tools', async () => {
    const { publication } = createGateAPublication()
    const bytes = await generateFillablePublicationPdf(publication)
    const document = await PDFDocument.load(bytes)
    const fields = document.getForm().getFields()

    expect(bytes.byteLength).toBeGreaterThan(1000)
    expect(fields.length).toBeGreaterThanOrEqual(15)
    expect(fields.some((field) => field.getName().includes('steady-state-gate-a'))).toBe(true)
  })
})
