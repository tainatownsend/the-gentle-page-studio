import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from '../compiler'
import { createPublicationLayout } from '../layout'
import { createPublicationFixture } from './createPublicationFixture'

const STEADY_STATE_ARCHITECTURE_MANUSCRIPT = `# The Steady State

[[GP:PAGE_TEMPLATE type="navigation"]]
## Table of Contents
Publication navigation.

[[GP:PAGE_TEMPLATE type="section-opener"]]
## Welcome / Let's Begin
A kinder approach to progress.

[[GP:PAGE_TEMPLATE type="navigation"]]
## How to Use This Journal
Start where you are.

[[GP:PAGE_TEMPLATE type="section-opener"]]
## Quote / Emotional Opener
A calmer page for a calmer moment.

[[GP:PAGE_TEMPLATE type="guided-framework"]]
## The 4-State Self-Scan
Notice your current state.

[[GP:PAGE_TEMPLATE type="emergency-tool"]]
## Emergency Unfreeze Protocol
Use the smallest useful interruption.

[[GP:PAGE_TEMPLATE type="daily-check-in"]]
## Daily Check-In
Notice before you push.

[[GP:PAGE_TEMPLATE type="tool-overview"]]
## Daily Regulation Tools Overview
Small tools for real moments.

[[GP:PAGE_TEMPLATE type="sensory-reset"]]
## Sensory Reset
Use your senses to come back to the present.

[[GP:PAGE_TEMPLATE type="prompt-writing"]]
## Thought Download
Get it out of your head.

[[GP:PAGE_TEMPLATE type="nervous-system-basics"]]
## Nervous System Basics / 101
A simple overview.

[[GP:PAGE_TEMPLATE type="trigger-scan"]]
## Triggers & Early Signs
Notice earlier and support sooner.

[[GP:PAGE_TEMPLATE type="regulation-menu"]]
## Regulation Menu
Find what works for you.

[[GP:PAGE_TEMPLATE type="weekly-reset"]]
## Weekly Reset
Reflect, realign, plan with kindness.

[[GP:PAGE_TEMPLATE type="planner-tracker"]]
## Weekly Plan
A realistic plan for a kinder week.

[[GP:PAGE_TEMPLATE type="deep-dive"]]
## Deep Dive Example
Understand, improve, feel better.

[[GP:PAGE_TEMPLATE type="prompt-writing"]]
## Reflection
Slow down, look with kindness, grow.

[[GP:PAGE_TEMPLATE type="goal-planner"]]
## Goal Planner
Small steps, meaningful progress.

[[GP:PAGE_TEMPLATE type="closing"]]
## You've Got This
A few gentle reminders to carry with you.
`

describe('The Steady State full architecture acceptance', () => {
  it('preserves the locked 20-page visual architecture from cover through closing', () => {
    const compiled = compilePublicationManuscript(STEADY_STATE_ARCHITECTURE_MANUSCRIPT)
    const layout = createPublicationLayout(
      createPublicationFixture({
        title: compiled.title,
        description: 'An ADHD Regulation Journal & Toolkit',
        content: compiled.content,
      }),
    )
    const contentPages = layout.pages.filter((page) => page.kind === 'content')

    expect(layout.pages).toHaveLength(20)
    expect(contentPages).toHaveLength(19)
    expect(contentPages.map((page) => page.pageTemplate)).toEqual([
      'navigation',
      'section-opener',
      'navigation',
      'section-opener',
      'guided-framework',
      'emergency-tool',
      'daily-check-in',
      'tool-overview',
      'sensory-reset',
      'prompt-writing',
      'nervous-system-basics',
      'trigger-scan',
      'regulation-menu',
      'weekly-reset',
      'planner-tracker',
      'deep-dive',
      'prompt-writing',
      'goal-planner',
      'closing',
    ])
    expect(
      layout.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'protocol-syntax-leak' ||
          diagnostic.code === 'heading-only-page',
      ),
    ).toBe(false)
  })
})
