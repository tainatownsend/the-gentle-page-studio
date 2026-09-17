import { describe, expect, it } from 'vitest'

import {
  compilePublicationManuscript,
  recoverPlainTextManuscriptHeadings,
} from './compilePublicationManuscriptResilient'

describe('compilePublicationManuscript resilient heading recovery', () => {
  it('recovers the Steady State title and opening section when Markdown markers are stripped', () => {
    const result = compilePublicationManuscript(`The Steady State: An ADHD Regulation Journal & Toolkit
Understanding Your Nervous System State
Regulation is not about staying perfectly calm or relentlessly productive. It is about learning to recognize where your nervous system is.

- [ ] Hyperarousal (Overwhelmed / Frantic)
- [ ] Hypoarousal (Freeze / Shutdown)`)

    expect(result.title).toBe('The Steady State: An ADHD Regulation Journal & Toolkit')
    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'heading',
        level: 2,
        text: 'Understanding Your Nervous System State',
      }),
    )
    expect(result.content.blocks[1]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        text: 'Regulation is not about staying perfectly calm or relentlessly productive. It is about learning to recognize where your nervous system is.',
      }),
    )
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'plain-text-heading-recovery', level: 'info' }),
      ]),
    )
  })

  it('leaves already structured Markdown unchanged', () => {
    const source = '# Journal\n\n## Opening\n\nNormal body copy.'
    expect(recoverPlainTextManuscriptHeadings(source)).toBe(source)
  })

  it('does not promote an ordinary opening sentence into a title', () => {
    const source = 'This journal begins with a simple invitation to notice what is happening.\n\n## Check-in'
    const result = compilePublicationManuscript(source)

    expect(result.title).toBe('Untitled publication')
    expect(result.content.blocks[0]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        text: 'This journal begins with a simple invitation to notice what is happening.',
      }),
    )
  })
})
