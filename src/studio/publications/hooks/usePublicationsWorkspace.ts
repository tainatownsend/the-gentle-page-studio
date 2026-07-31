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
      updatePublication,
      getPublication,
    }),
    [
      publications,
      isCreating,
      startCreating,
      cancelCreating,
      createDraft,
      updatePublication,
      getPublication,
    ],
  )
}
