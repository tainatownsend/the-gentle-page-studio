import type { PublicationContent, PublicationStatus } from '../types'

export const PUBLICATION_DRAFT_RECOVERY_STORAGE_KEY =
  'the-gentle-page-studio.publication-draft-recovery.v1'

export type PublicationDraftRecoveryValues = {
  title: string
  description?: string
  status: PublicationStatus
  content: PublicationContent
}

type PublicationDraftRecoveryEntry = {
  publicationId: string
  baseUpdatedAt: string
  savedAt: string
  values: PublicationDraftRecoveryValues
}

function loadEntries(): PublicationDraftRecoveryEntry[] {
  try {
    const raw = localStorage.getItem(PUBLICATION_DRAFT_RECOVERY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEntries(entries: PublicationDraftRecoveryEntry[]): void {
  try {
    localStorage.setItem(PUBLICATION_DRAFT_RECOVERY_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Recovery is best-effort and must never block authoring.
  }
}

export function loadPublicationDraftRecovery(
  publicationId: string,
  baseUpdatedAt: string,
): PublicationDraftRecoveryValues | undefined {
  const entry = loadEntries().find((candidate) => candidate.publicationId === publicationId)

  if (!entry || entry.baseUpdatedAt !== baseUpdatedAt) {
    return undefined
  }

  return {
    ...entry.values,
    content: {
      blocks: entry.values.content.blocks.map((block) => ({ ...block })),
    },
  }
}

export function savePublicationDraftRecovery(
  publicationId: string,
  baseUpdatedAt: string,
  values: PublicationDraftRecoveryValues,
): void {
  const entry: PublicationDraftRecoveryEntry = {
    publicationId,
    baseUpdatedAt,
    savedAt: new Date().toISOString(),
    values: {
      ...values,
      content: {
        blocks: values.content.blocks.map((block) => ({ ...block })),
      },
    },
  }

  const remaining = loadEntries().filter((candidate) => candidate.publicationId !== publicationId)
  saveEntries([entry, ...remaining])
}

export function clearPublicationDraftRecovery(publicationId: string): void {
  saveEntries(loadEntries().filter((candidate) => candidate.publicationId !== publicationId))
}
