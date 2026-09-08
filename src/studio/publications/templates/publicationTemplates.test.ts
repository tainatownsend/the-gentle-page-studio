import { describe, expect, it } from 'vitest'

import {
  cloneTemplateContent,
  getPublicationTemplate,
  PUBLICATION_TEMPLATES,
} from './publicationTemplates'

describe('publicationTemplates', () => {
  it('includes a blank default and guided Gentle Page starters', () => {
    expect(PUBLICATION_TEMPLATES.map((template) => template.id)).toEqual([
      'blank',
      'guided-journal',
      'daily-check-in',
    ])
    expect(getPublicationTemplate(undefined).id).toBe('blank')
  })

  it('clones template blocks with fresh durable ids', () => {
    const template = getPublicationTemplate('guided-journal')
    const first = cloneTemplateContent(template)
    const second = cloneTemplateContent(template)

    expect(first.blocks).toHaveLength(template.content.blocks.length)
    expect(first.blocks.map((block) => block.id)).not.toEqual(
      template.content.blocks.map((block) => block.id),
    )
    expect(first.blocks.map((block) => block.id)).not.toEqual(
      second.blocks.map((block) => block.id),
    )
  })
})
