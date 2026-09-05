import type { PublicationTemplate } from '../types/publicationTemplate'

export const PUBLICATION_TEMPLATES: readonly PublicationTemplate[] = [
  {
    id: 'blank',
    name: 'Blank publication',
    description: 'Start with an empty publication and build every block yourself.',
    content: { blocks: [] },
  },
  {
    id: 'guided-journal',
    name: 'Guided journal',
    description: 'A simple reflection flow with a prompt, response space, and check-in.',
    content: {
      blocks: [
        { id: 'template-heading', type: 'heading', level: 2, text: 'Reflection' },
        {
          id: 'template-intro',
          type: 'paragraph',
          text: 'Use this page to slow down, notice what is present, and capture what matters.',
        },
        {
          id: 'template-response',
          type: 'multiline-text-field',
          text: 'What would you like to reflect on today?',
        },
        {
          id: 'template-checkbox',
          type: 'checkbox-field',
          text: 'I gave myself enough time to reflect.',
        },
      ],
    },
  },
  {
    id: 'daily-check-in',
    name: 'Daily check-in',
    description: 'A compact page for intention, reflection, and completion.',
    content: {
      blocks: [
        { id: 'template-daily-heading', type: 'heading', level: 2, text: 'Daily check-in' },
        {
          id: 'template-daily-intention',
          type: 'multiline-text-field',
          text: 'What matters most today?',
        },
        {
          id: 'template-daily-reflection',
          type: 'multiline-text-field',
          text: 'What do I want to remember from today?',
        },
        {
          id: 'template-daily-complete',
          type: 'checkbox-field',
          text: 'Today feels complete enough to close.',
        },
      ],
    },
  },
]

export function getPublicationTemplate(templateId: string | undefined): PublicationTemplate {
  return (
    PUBLICATION_TEMPLATES.find((template) => template.id === templateId) ??
    PUBLICATION_TEMPLATES[0]
  )
}

export function cloneTemplateContent(template: PublicationTemplate) {
  return {
    blocks: template.content.blocks.map((block) => ({
      ...block,
      id:
        typeof globalThis.crypto?.randomUUID === 'function'
          ? globalThis.crypto.randomUUID()
          : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    })),
  }
}
