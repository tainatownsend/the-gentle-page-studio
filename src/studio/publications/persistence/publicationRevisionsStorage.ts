import type {
  PublicationBlock,
  PublicationContent,
  PublicationDocumentSettings,
  PublicationRevision,
} from '../types'

export const LEGACY_PUBLICATION_REVISIONS_STORAGE_KEY =
  'the-gentle-page:publication-revisions:v1'

export const PUBLICATION_REVISIONS_STORAGE_KEY =
  'the-gentle-page:publication-revisions:v2'

type LegacyPublicationBlockV1 =
  | {
      id: string
      type: 'heading'
      level: 1 | 2 | 3
      text: string
    }
  | {
      id: string
      type: 'paragraph'
      text: string
    }

type LegacyPublicationRevisionV1 = Omit<PublicationRevision, 'content'> & {
  content: {
    blocks: LegacyPublicationBlockV1[]
  }
}

type PersistedPublicationRevisionsV1 = {
  version: 1
  revisions: LegacyPublicationRevisionV1[]
}

type PersistedPublicationRevisionsV2 = {
  version: 2
  revisions: PublicationRevision[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isLegacyPublicationBlockV1(value: unknown): value is LegacyPublicationBlockV1 {
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

function isPublicationBlock(value: unknown): value is PublicationBlock {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    typeof value.text !== 'string'
  ) {
    return false
  }

  if (
    value.type === 'paragraph' ||
    value.type === 'multiline-text-field' ||
    value.type === 'checkbox-field'
  ) {
    return true
  }

  return value.type === 'heading' && (value.level === 1 || value.level === 2 || value.level === 3)
}

function isLegacyPublicationContentV1(value: unknown): boolean {
  return (
    isRecord(value) &&
    Array.isArray(value.blocks) &&
    value.blocks.every(isLegacyPublicationBlockV1)
  )
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

function hasValidRevisionBase(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.publicationId === 'string' &&
    value.publicationId.trim().length > 0 &&
    typeof value.title === 'string' &&
    (value.description === undefined || typeof value.description === 'string') &&
    isPublicationDocumentSettings(value.documentSettings) &&
    isValidDate(value.publishedAt)
  )
}

function isLegacyPublicationRevisionV1(value: unknown): value is LegacyPublicationRevisionV1 {
  return hasValidRevisionBase(value) && isRecord(value) && isLegacyPublicationContentV1(value.content)
}

function isPublicationRevision(value: unknown): value is PublicationRevision {
  return hasValidRevisionBase(value) && isRecord(value) && isPublicationContent(value.content)
}

function isPersistedRevisionWorkspaceV1(value: unknown): value is PersistedPublicationRevisionsV1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.revisions) &&
    value.revisions.every(isLegacyPublicationRevisionV1)
  )
}

function isPersistedRevisionWorkspaceV2(value: unknown): value is PersistedPublicationRevisionsV2 {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.revisions) &&
    value.revisions.every(isPublicationRevision)
  )
}

function migrateRevisionV1(revision: LegacyPublicationRevisionV1): PublicationRevision {
  return {
    ...revision,
    content: {
      blocks: revision.content.blocks.map((block) => ({ ...block })),
    },
  }
}

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function readRevisionWorkspace(storage: Storage, key: string): unknown {
  const serialized = storage.getItem(key)

  if (!serialized) {
    return undefined
  }

  return JSON.parse(serialized)
}

export function loadPublicationRevisions(): PublicationRevision[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const currentWorkspace = readRevisionWorkspace(storage, PUBLICATION_REVISIONS_STORAGE_KEY)

    if (isPersistedRevisionWorkspaceV2(currentWorkspace)) {
      return currentWorkspace.revisions
    }

    const legacyWorkspace = readRevisionWorkspace(
      storage,
      LEGACY_PUBLICATION_REVISIONS_STORAGE_KEY,
    )

    if (isPersistedRevisionWorkspaceV1(legacyWorkspace)) {
      return legacyWorkspace.revisions.map(migrateRevisionV1)
    }

    return []
  } catch {
    return []
  }
}

export function savePublicationRevisions(revisions: readonly PublicationRevision[]): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const workspace: PersistedPublicationRevisionsV2 = {
    version: 2,
    revisions: [...revisions],
  }

  try {
    storage.setItem(PUBLICATION_REVISIONS_STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Local persistence is best-effort and must not break the app.
  }
}
