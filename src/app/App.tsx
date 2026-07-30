import { useState } from 'react'

import {
  PublicationsPage,
  type Publication,
  type PublicationCreateValues,
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

  function handleSubmitCreate(values: PublicationCreateValues) {
    setPublications((current) => [
      createPublication(values, current.length + 1),
      ...current,
    ])
    setIsCreating(false)
  }

  return (
    <PublicationsPage
      publications={publications}
      isCreating={isCreating}
      onCreate={() => setIsCreating(true)}
      onCancelCreate={() => setIsCreating(false)}
      onSubmitCreate={handleSubmitCreate}
    />
  )
}
