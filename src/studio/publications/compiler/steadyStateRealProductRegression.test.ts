import { describe, expect, it } from 'vitest'

import { compileGentlePageManuscript } from './compileGentlePageManuscript'

describe('Steady State real-product regression', () => {
  it('compiles bulleted response directives without leaking GP syntax', () => {
    const manuscript = `# The Steady State

Two Supporting Tasks (Low Cognitive Lift)
* [[GP:RESPONSE size="short"]]
* [[GP:RESPONSE size="short"]]

Personal Go-To Dopamine Seeds
* [[GP:RESPONSE size="short"]]
* [[GP:RESPONSE size="short"]]
* [[GP:RESPONSE size="short"]]`

    const result = compileGentlePageManuscript(manuscript)
    const fields = result.content.blocks.filter((block) => block.type === 'multiline-text-field')

    expect(fields).toHaveLength(5)
    expect(fields.every((field) => field.responseSize === 'short')).toBe(true)
    expect(JSON.stringify(result.content)).not.toContain('[[GP:RESPONSE')
  })
})
