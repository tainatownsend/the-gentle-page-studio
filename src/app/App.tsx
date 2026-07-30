import { useState } from 'react'

import {
  PublicationEditorPage,
  PublicationsPage,
  type Publication,
  type PublicationCreateValues,
  type PublicationEditorValues,
} from '@/studio/publications'

const initialPublications: Publication[] = []

function createPublication(
  values: PublicationCreateValues,
  sequence: number,
): Publication {
  return {
    id: `publication-${sequence}`,
    title: values.title,
    description: values.description,
    updatedAt: 'Just now',
    status: 'draft',
  }
}

export function App() {
  const [publications, setPublications] = useState(
    initialPublications,
  )
  const [isCreating, setIsCreating] = useState(false)
  const [activePublicationId, setActivePublicationId] =
    useState<string>()

  const activePublication = publications.find(
    (publication) => publication.id === activePublicationId,
  )

  function handleSubmitCreate(values: PublicationCreateValues) {
    setPublications((current) => [
      createPublication(values, current.length + 1),
      ...current,
    ])
    setIsCreating(false)
  }

  function handleSavePublication(
    values: PublicationEditorValues,
  ) {
    if (!activePublicationId) {
      return
    }

    setPublications((current) =>
      current.map((publication) =>
        publication.id === activePublicationId
          ? {
              ...publication,
              ...values,
              updatedAt: 'Just now',
            }
          : publication,
      ),
    )
    setActivePublicationId(undefined)
  }

  if (activePublication) {
    return (
      <PublicationEditorPage
        publication={activePublication}
        onBack={() => setActivePublicationId(undefined)}
        onSave={handleSavePublication}
      />
    )
  }

  return (
    <PublicationsPage
      publications={publications}
      isCreating={isCreating}
      onCreate={() => setIsCreating(true)}
      onCancelCreate={() => setIsCreating(false)}
      onSubmitCreate={handleSubmitCreate}
      onOpen={setActivePublicationId}
    />
  )
}
