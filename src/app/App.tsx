import { useState } from 'react'

import {
  PublicationsPage,
  type Publication,
} from '@/studio/publications'

const initialPublications: Publication[] = []

const firstPublication: Publication = {
  id: 'adhd-emotional-regulation-journal',
  title: 'ADHD Emotional Regulation Journal',
  description:
    'A supportive journal for noticing emotions, understanding patterns, and choosing gentle next steps.',
  updatedAt: 'July 29, 2026',
  status: 'draft',
}

export function App() {
  const [publications, setPublications] = useState(
    initialPublications,
  )

  function handleCreate() {
    setPublications((current) =>
      current.length === 0
        ? [firstPublication]
        : current,
    )
  }

  return (
    <PublicationsPage
      publications={publications}
      onCreate={handleCreate}
    />
  )
}
