import type { Publication } from '../types'

export const PUBLICATIONS_STORAGE_KEY = 'the-gentle-page:publications-workspace:v1'

type PersistedPublicationsWorkspaceV1 = {
  version: 1
  publications: Publication[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isPublication(value: unknown): value is Publication {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.title === 'string' &&
    (value.description === undefined || typeof value.description === 'string') &&
    (value.status === 'draft' || value.status === 'published') &&
    isValidDate(value.createdAt) &&
    isValidDate(value.updatedAt)
  )
}

function isPersistedWorkspaceV1(value: unknown): value is PersistedPublicationsWorkspaceV1 {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.version === 1 &&
    Array.isArray(value.publications) &&
    value.publications.every(isPublication)
  )
}

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function loadPublications(): Publication[] {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const serializedWorkspace = storage.getItem(PUBLICATIONS_STORAGE_KEY)

    if (!serializedWorkspace) {
      return []
    }

    const parsedWorkspace: unknown = JSON.parse(serializedWorkspace)

    if (!isPersistedWorkspaceV1(parsedWorkspace)) {
      return []
    }

    return parsedWorkspace.publications
  } catch {
    return []
  }
}

export function savePublications(publications: readonly Publication[]): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const workspace: PersistedPublicationsWorkspaceV1 = {
    version: 1,
    publications: [...publications],
  }

  try {
    storage.setItem(PUBLICATIONS_STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Local persistence is best-effort and must not break the app.
  }
}
