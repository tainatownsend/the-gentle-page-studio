import {
  createDefaultPublicationDocumentSettings,
  type Publication,
  type PublicationBlock,
  type PublicationContent,
  type PublicationDocumentSettings,
  type PublicationStatus,
} from '../types'

export const LEGACY_PUBLICATIONS_STORAGE_KEY = 'the-gentle-page:publications-workspace:v1'

export const LEGACY_PUBLICATIONS_STORAGE_KEY_V2 = 'the-gentle-page:publications-workspace:v2'

export const LEGACY_PUBLICATIONS_STORAGE_KEY_V3 = 'the-gentle-page:publications-workspace:v3'

export const PUBLICATIONS_STORAGE_KEY = 'the-gentle-page:publications-workspace:v4'

type LegacyPublicationV1 = {
  id: string
  title: string
  description?: string
  status: PublicationStatus
  createdAt: string
  updatedAt: string
}

type LegacyPublicationBlockV3 =
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

type LegacyPublicationContentV3 = {
  blocks: LegacyPublicationBlockV3[]
}

type LegacyPublicationV2 = LegacyPublicationV1 & {
  content: LegacyPublicationContentV3
}

type LegacyPublicationV3 = LegacyPublicationV2 & {
  documentSettings: PublicationDocumentSettings
}

type PersistedPublicationsWorkspaceV1 = {
  version: 1
  publications: LegacyPublicationV1[]
}

type PersistedPublicationsWorkspaceV2 = {
  version: 2
  publications: LegacyPublicationV2[]
}

type PersistedPublicationsWorkspaceV3 = {
  version: 3
  publications: LegacyPublicationV3[]
}

type PersistedPublicationsWorkspaceV4 = {
  version: 4
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

function isLegacyPublicationBlockV3(value: unknown): value is LegacyPublicationBlockV3 {
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

function isLegacyPublicationContentV3(value: unknown): value is LegacyPublicationContentV3 {
  return (
    isRecord(value) &&
    Array.isArray(value.blocks) &&
    value.blocks.every(isLegacyPublicationBlockV3)
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

  const { margins } = value

  return (
    isRecord(margins) &&
    isMarginValue(margins.top) &&
    isMarginValue(margins.right) &&
    isMarginValue(margins.bottom) &&
    isMarginValue(margins.left)
  )
}

function isLegacyPublicationV1(value: unknown): value is LegacyPublicationV1 {
  return isBasePublication(value)
}

function isLegacyPublicationV2(value: unknown): value is LegacyPublicationV2 {
  return isBasePublication(value) && isRecord(value) && isLegacyPublicationContentV3(value.content)
}

function isLegacyPublicationV3(value: unknown): value is LegacyPublicationV3 {
  if (!isLegacyPublicationV2(value) || !isRecord(value)) {
    return false
  }

  return isPublicationDocumentSettings(value.documentSettings)
}

function isPublication(value: unknown): value is Publication {
  return (
    isBasePublication(value) &&
    isRecord(value) &&
    isPublicationContent(value.content) &&
    isPublicationDocumentSettings(value.documentSettings)
  )
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
    value.publications.every(isLegacyPublicationV2)
  )
}

function isPersistedWorkspaceV3(value: unknown): value is PersistedPublicationsWorkspaceV3 {
  return (
    isRecord(value) &&
    value.version === 3 &&
    Array.isArray(value.publications) &&
    value.publications.every(isLegacyPublicationV3)
  )
}

function isPersistedWorkspaceV4(value: unknown): value is PersistedPublicationsWorkspaceV4 {
  return (
    isRecord(value) &&
    value.version === 4 &&
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
    documentSettings: createDefaultPublicationDocumentSettings(),
  }
}

function migratePublicationV2(publication: LegacyPublicationV2): Publication {
  return {
    ...publication,
    content: {
      blocks: publication.content.blocks.map((block) => ({ ...block })),
    },
    documentSettings: createDefaultPublicationDocumentSettings(),
  }
}

function migratePublicationV3(publication: LegacyPublicationV3): Publication {
  return {
    ...publication,
    content: {
      blocks: publication.content.blocks.map((block) => ({ ...block })),
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

    if (isPersistedWorkspaceV4(currentWorkspace)) {
      return currentWorkspace.publications
    }

    const legacyWorkspaceV3 = readWorkspace(storage, LEGACY_PUBLICATIONS_STORAGE_KEY_V3)

    if (isPersistedWorkspaceV3(legacyWorkspaceV3)) {
      return legacyWorkspaceV3.publications.map(migratePublicationV3)
    }

    const legacyWorkspaceV2 = readWorkspace(storage, LEGACY_PUBLICATIONS_STORAGE_KEY_V2)

    if (isPersistedWorkspaceV2(legacyWorkspaceV2)) {
      return legacyWorkspaceV2.publications.map(migratePublicationV2)
    }

    const legacyWorkspaceV1 = readWorkspace(storage, LEGACY_PUBLICATIONS_STORAGE_KEY)

    if (isPersistedWorkspaceV1(legacyWorkspaceV1)) {
      return legacyWorkspaceV1.publications.map(migratePublicationV1)
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

  const workspace: PersistedPublicationsWorkspaceV4 = {
    version: 4,
    publications: [...publications],
  }

  try {
    storage.setItem(PUBLICATIONS_STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Local persistence is best-effort and must not break the app.
  }
}
