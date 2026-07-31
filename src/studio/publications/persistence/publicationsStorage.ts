import type { Publication, PublicationBlock, PublicationContent, PublicationStatus } from '../types'

export const LEGACY_PUBLICATIONS_STORAGE_KEY = 'the-gentle-page:publications-workspace:v1'

export const PUBLICATIONS_STORAGE_KEY = 'the-gentle-page:publications-workspace:v2'

type LegacyPublicationV1 = {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  createdAt: string
  updatedAt: string
}

type PersistedPublicationsWorkspaceV1 = {
  version: 1
  publications: LegacyPublicationV1[]
}

type PersistedPublicationsWorkspaceV2 = {
  version: 2
  publications: Publication[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isPublicationStatus(value: unknown): value is PublicationStatus {
  return value === 'draft' || value === 'published'
}

function isBasePublication(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.title === 'string' &&
    (value.description === undefined || typeof value.description === 'string') &&
    isPublicationStatus(value.status) &&
    isValidDate(value.createdAt) &&
    isValidDate(value.updatedAt)
  )
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

function isLegacyPublicationV1(value: unknown): value is LegacyPublicationV1 {
  return isBasePublication(value)
}

function isPublication(value: unknown): value is Publication {
  return isBasePublication(value) && isRecord(value) && isPublicationContent(value.content)
}

function isPersistedWorkspaceV1(value: unknown): value is PersistedPublicationsWorkspaceV1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.publications) &&
    value.publications.every(isLegacyPublicationV1)
  )
}

function isPersistedWorkspaceV2(value: unknown): value is PersistedPublicationsWorkspaceV2 {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.publications) &&
    value.publications.every(isPublication)
  )
}

function migratePublicationV1(publication: LegacyPublicationV1): Publication {
  return {
    ...publication,
    content: {
      blocks: [],
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

function readWorkspace(storage: Storage, key: string): unknown {
  const serializedWorkspace = storage.getItem(key)

  if (!serializedWorkspace) {
    return undefined
  }

  return JSON.parse(serializedWorkspace)
}

export function loadPublications(): Publication[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const currentWorkspace = readWorkspace(storage, PUBLICATIONS_STORAGE_KEY)

    if (isPersistedWorkspaceV2(currentWorkspace)) {
      return currentWorkspace.publications
    }

    const legacyWorkspace = readWorkspace(storage, LEGACY_PUBLICATIONS_STORAGE_KEY)

    if (isPersistedWorkspaceV1(legacyWorkspace)) {
      return legacyWorkspace.publications.map(migratePublicationV1)
    }

    return []
  } catch {
    return []
  }
}

export function savePublications(publications: readonly Publication[]): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const workspace: PersistedPublicationsWorkspaceV2 = {
    version: 2,
    publications: [...publications],
  }

  try {
    storage.setItem(PUBLICATIONS_STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Local persistence is best-effort and must not break the app.
  }
}
