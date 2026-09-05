import {
  createDefaultPublicationDocumentSettings,
  type Publication,
} from '../types'

export const DEFAULT_PUBLICATION_TIMESTAMP = '2026-07-30T22:47:00.000Z'

export function createPublicationFixture(overrides: Partial<Publication> = {}): Publication {
  return {
    id: 'publication-1',
    title: 'Untitled publication',
    status: 'draft',
    content: {
      blocks: [],
    },
    documentSettings: createDefaultPublicationDocumentSettings(),
    createdAt: DEFAULT_PUBLICATION_TIMESTAMP,
    updatedAt: DEFAULT_PUBLICATION_TIMESTAMP,
    ...overrides,
  }
}
