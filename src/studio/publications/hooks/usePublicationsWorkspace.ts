import { useCallback, useEffect, useMemo, useState } from 'react'

import type { PublicationCreateValues } from '../components'
import type { PublicationEditorValues } from '../pages'
import {
  loadPublicationRevisions,
  loadPublications,
  savePublicationRevisions,
  savePublications,
} from '../persistence'
import { cloneTemplateContent, getPublicationTemplate } from '../templates'
import {
  createDefaultPublicationDocumentSettings,
  type Publication,
  type PublicationContent,
  type PublicationDocumentSettings,
  type PublicationRevision,
} from '../types'
import { createPublicationId } from '../utils'

function cloneContent(content: PublicationContent): PublicationContent {
  return {
    blocks: content.blocks.map((block) => ({
      ...block,
      layout: block.layout ? { ...block.layout } : undefined,
    })),
  }
}

function cloneDocumentSettings(
  settings: PublicationDocumentSettings,
): PublicationDocumentSettings {
  return {
    ...settings,
    margins: {
      ...settings.margins,
    },
  }
}

function createRevisionId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `revision-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createPublication(values: PublicationCreateValues): Publication {
  const timestamp = new Date().toISOString()
  const template = getPublicationTemplate(values.templateId)

  return {
    id: createPublicationId(),
    title: values.title,
    description: values.description,
    status: 'draft',
    content: values.content ? cloneContent(values.content) : cloneTemplateContent(template),
    documentSettings: createDefaultPublicationDocumentSettings(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function createPublishedRevision(
  publication: Publication,
  values: PublicationEditorValues,
  publishedAt: string,
): PublicationRevision {
  return {
    id: createRevisionId(),
    publicationId: publication.id,
    title: values.title,
    description: values.description,
    content: cloneContent(values.content),
    documentSettings: cloneDocumentSettings(publication.documentSettings),
    publishedAt,
  }
}

function getPublicationCopyBaseTitle(title: string): string {
  return title.replace(/ — Copy(?: \d+)?$/, '')
}

function getNextPublicationCopyTitle(
  publication: Publication,
  publications: readonly Publication[],
): string {
  const baseTitle = getPublicationCopyBaseTitle(publication.title)
  const firstCopyTitle = `${baseTitle} — Copy`
  const numberedCopyPrefix = `${firstCopyTitle} `

  const highestCopyNumber = publications.reduce((highest, currentPublication) => {
    if (currentPublication.title === firstCopyTitle) {
      return Math.max(highest, 1)
    }

    if (!currentPublication.title.startsWith(numberedCopyPrefix)) {
      return highest
    }

    const suffix = currentPublication.title.slice(numberedCopyPrefix.length)

    if (!/^\d+$/.test(suffix)) {
      return highest
    }

    return Math.max(highest, Number.parseInt(suffix, 10))
  }, 0)

  const nextCopyNumber = highestCopyNumber + 1

  return nextCopyNumber === 1 ? firstCopyTitle : `${firstCopyTitle} ${nextCopyNumber}`
}

function createPublicationCopy(
  publication: Publication,
  publications: readonly Publication[],
): Publication {
  const timestamp = new Date().toISOString()

  return {
    ...publication,
    id: createPublicationId(),
    content: cloneContent(publication.content),
    documentSettings: cloneDocumentSettings(publication.documentSettings),
    title: getNextPublicationCopyTitle(publication, publications),
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function createRestoredDraft(revision: PublicationRevision): Publication {
  const timestamp = new Date().toISOString()

  return {
    id: createPublicationId(),
    title: revision.title,
    description: revision.description,
    status: 'draft',
    content: cloneContent(revision.content),
    documentSettings: cloneDocumentSettings(revision.documentSettings),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export type PublicationsWorkspace = {
  publications: readonly Publication[]
  revisions: readonly PublicationRevision[]
  createDraft: (values: PublicationCreateValues) => Publication
  duplicatePublication: (publicationId: string) => Publication | undefined
  deletePublication: (publicationId: string) => void
  updatePublication: (publicationId: string, values: PublicationEditorValues) => void
  getPublication: (publicationId: string | undefined) => Publication | undefined
  getPublicationRevisions: (publicationId: string) => PublicationRevision[]
  restorePublicationRevision: (revisionId: string) => Publication | undefined
}

export function usePublicationsWorkspace(): PublicationsWorkspace {
  const [publications, setPublications] = useState<Publication[]>(loadPublications)
  const [revisions, setRevisions] = useState<PublicationRevision[]>(loadPublicationRevisions)

  useEffect(() => {
    savePublications(publications)
  }, [publications])

  useEffect(() => {
    savePublicationRevisions(revisions)
  }, [revisions])

  const createDraft = useCallback((values: PublicationCreateValues): Publication => {
    const createdPublication = createPublication(values)

    setPublications((current) => [createdPublication, ...current])

    return createdPublication
  }, [])

  const duplicatePublication = useCallback(
    (publicationId: string): Publication | undefined => {
      const sourcePublication = publications.find((publication) => publication.id === publicationId)

      if (!sourcePublication) {
        return undefined
      }

      const duplicatedPublication = createPublicationCopy(sourcePublication, publications)

      setPublications((current) => [duplicatedPublication, ...current])

      return duplicatedPublication
    },
    [publications],
  )

  const deletePublication = useCallback((publicationId: string): void => {
    setPublications((current) => {
      const nextPublications = current.filter((publication) => publication.id !== publicationId)

      return nextPublications.length === current.length ? current : nextPublications
    })
    setRevisions((current) =>
      current.filter((revision) => revision.publicationId !== publicationId),
    )
  }, [])

  const updatePublication = useCallback(
    (publicationId: string, values: PublicationEditorValues) => {
      const currentPublication = publications.find((publication) => publication.id === publicationId)

      if (!currentPublication) {
        return
      }

      const timestamp = new Date().toISOString()
      const isPublishing = currentPublication.status !== 'published' && values.status === 'published'

      if (isPublishing) {
        const revision = createPublishedRevision(currentPublication, values, timestamp)
        setRevisions((current) => [revision, ...current])
      }

      setPublications((current) =>
        current.map((publication) =>
          publication.id === publicationId
            ? {
                ...publication,
                ...values,
                updatedAt: timestamp,
              }
            : publication,
        ),
      )
    },
    [publications],
  )

  const getPublication = useCallback(
    (publicationId: string | undefined) =>
      publications.find((publication) => publication.id === publicationId),
    [publications],
  )

  const getPublicationRevisions = useCallback(
    (publicationId: string) =>
      revisions.filter((revision) => revision.publicationId === publicationId),
    [revisions],
  )

  const restorePublicationRevision = useCallback(
    (revisionId: string): Publication | undefined => {
      const revision = revisions.find((candidate) => candidate.id === revisionId)

      if (!revision) {
        return undefined
      }

      const restoredDraft = createRestoredDraft(revision)
      setPublications((current) => [restoredDraft, ...current])

      return restoredDraft
    },
    [revisions],
  )

  return useMemo(
    () => ({
      publications,
      revisions,
      createDraft,
      duplicatePublication,
      deletePublication,
      updatePublication,
      getPublication,
      getPublicationRevisions,
      restorePublicationRevision,
    }),
    [
      publications,
      revisions,
      createDraft,
      duplicatePublication,
      deletePublication,
      updatePublication,
      getPublication,
      getPublicationRevisions,
      restorePublicationRevision,
    ],
  )
}
