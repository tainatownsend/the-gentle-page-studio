import type {
  PublicationBlock,
  PublicationContent,
  PublicationDocumentSettings,
  PublicationRevision,
} from '../types'

export const PUBLICATION_REVISIONS_STORAGE_KEY = 'the-gentle-page:publication-revisions:v1'

type PersistedPublicationRevisions = {
  version: 1
  revisions: PublicationRevision[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isPublicationBlock(value: unknown): value is PublicationBlock {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    typeof value.text !== 'string'
  ) {
    return false
  }

  if (value.type === 'paragraph') {
    return true
  }

  return value.type === 'heading' && (value.level === 1 || value.level === 2 || value.level === 3)
}

function isPublicationContent(value: unknown): value is PublicationContent {
  return isRecord(value) && Array.isArray(value.blocks) && value.blocks.every(isPublicationBlock)
}

function isMarginValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isPublicationDocumentSettings(value: unknown): value is PublicationDocumentSettings {
  if (!isRecord(value) || value.pageSize !== 'us-letter' || value.orientation !== 'portrait') {
    return false
  }

  return (
    isRecord(value.margins) &&
    isMarginValue(value.margins.top) &&
    isMarginValue(value.margins.right) &&
    isMarginValue(value.margins.bottom) &&
    isMarginValue(value.margins.left)
  )
}

function isPublicationRevision(value: unknown): value is PublicationRevision {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.publicationId === 'string' &&
    value.publicationId.trim().length > 0 &&
    typeof value.title === 'string' &&
    (value.description === undefined || typeof value.description === 'string') &&
    isPublicationContent(value.content) &&
    isPublicationDocumentSettings(value.documentSettings) &&
    isValidDate(value.publishedAt)
  )
}

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function loadPublicationRevisions(): PublicationRevision[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const serialized = storage.getItem(PUBLICATION_REVISIONS_STORAGE_KEY)

    if (!serialized) {
      return []
    }

    const workspace: unknown = JSON.parse(serialized)

    if (
      !isRecord(workspace) ||
      workspace.version !== 1 ||
      !Array.isArray(workspace.revisions) ||
      !workspace.revisions.every(isPublicationRevision)
    ) {
      return []
    }

    return workspace.revisions
  } catch {
    return []
  }
}

export function savePublicationRevisions(revisions: readonly PublicationRevision[]): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const workspace: PersistedPublicationRevisions = {
    version: 1,
    revisions: [...revisions],
  }

  try {
    storage.setItem(PUBLICATION_REVISIONS_STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Local persistence is best-effort and must not break the app.
  }
}
