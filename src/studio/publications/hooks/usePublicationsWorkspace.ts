import { useCallback, useMemo, useRef, useState } from 'react'

import type { Publication, PublicationCreateValues, PublicationEditorValues } from '../index'

const initialPublications: Publication[] = []

function createPublication(values: PublicationCreateValues, sequence: number): Publication {
  return {
    id: `publication-${sequence}`,
    title: values.title,
    description: values.description,
    updatedAt: 'Just now',
    status: 'draft',
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
  const [publications, setPublications] = useState<Publication[]>(initialPublications)
  const [isCreating, setIsCreating] = useState(false)
  const nextPublicationSequence = useRef(1)

  const startCreating = useCallback(() => {
    setIsCreating(true)
  }, [])

  const cancelCreating = useCallback(() => {
    setIsCreating(false)
  }, [])

  const createDraft = useCallback((values: PublicationCreateValues): Publication => {
    const createdPublication = createPublication(values, nextPublicationSequence.current)

    nextPublicationSequence.current += 1

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
                updatedAt: 'Just now',
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
