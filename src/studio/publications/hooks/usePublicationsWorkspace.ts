import { useCallback, useEffect, useMemo, useState } from 'react'

import type { PublicationCreateValues } from '../components'
import type { PublicationEditorValues } from '../pages'
import { loadPublications, savePublications } from '../persistence'
import type { Publication } from '../types'
import { createPublicationId } from '../utils'

function createPublication(values: PublicationCreateValues): Publication {
  const timestamp = new Date().toISOString()

  return {
    id: createPublicationId(),
    title: values.title,
    description: values.description,
    status: 'draft',
    content: {
      blocks: [],
    },
    createdAt: timestamp,
    updatedAt: timestamp,
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
    content: {
      blocks: publication.content.blocks.map((block) => ({
        ...block,
      })),
    },
    title: getNextPublicationCopyTitle(publication, publications),
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export type PublicationsWorkspace = {
  publications: readonly Publication[]
  isCreating: boolean
  startCreating: () => void
  cancelCreating: () => void
  createDraft: (values: PublicationCreateValues) => Publication
  duplicatePublication: (publicationId: string) => Publication | undefined
  deletePublication: (publicationId: string) => void
  updatePublication: (publicationId: string, values: PublicationEditorValues) => void
  getPublication: (publicationId: string | undefined) => Publication | undefined
}

export function usePublicationsWorkspace(): PublicationsWorkspace {
  const [publications, setPublications] = useState<Publication[]>(loadPublications)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    savePublications(publications)
  }, [publications])

  const startCreating = useCallback(() => {
    setIsCreating(true)
  }, [])

  const cancelCreating = useCallback(() => {
    setIsCreating(false)
  }, [])

  const createDraft = useCallback((values: PublicationCreateValues): Publication => {
    const createdPublication = createPublication(values)

    setPublications((current) => [createdPublication, ...current])
    setIsCreating(false)

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
  }, [])

  const updatePublication = useCallback(
    (publicationId: string, values: PublicationEditorValues) => {
      setPublications((current) =>
        current.map((publication) =>
          publication.id === publicationId
            ? {
                ...publication,
                ...values,
                updatedAt: new Date().toISOString(),
              }
            : publication,
        ),
      )
    },
    [],
  )

  const getPublication = useCallback(
    (publicationId: string | undefined) =>
      publications.find((publication) => publication.id === publicationId),
    [publications],
  )

  return useMemo(
    () => ({
      publications,
      isCreating,
      startCreating,
      cancelCreating,
      createDraft,
      duplicatePublication,
      deletePublication,
      updatePublication,
      getPublication,
    }),
    [
      publications,
      isCreating,
      startCreating,
      cancelCreating,
      createDraft,
      duplicatePublication,
      deletePublication,
      updatePublication,
      getPublication,
    ],
  )
}
