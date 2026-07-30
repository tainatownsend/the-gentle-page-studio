import { useState, type ReactElement } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'

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

type PublicationEditorRouteProps = {
  publications: readonly Publication[]
  onSave: (
    publicationId: string,
    values: PublicationEditorValues,
  ) => void
}

function PublicationEditorRoute({
  publications,
  onSave,
}: PublicationEditorRouteProps): ReactElement {
  const navigate = useNavigate()
  const { publicationId } = useParams()

  const publication = publications.find(
    (item) => item.id === publicationId,
  )

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  return (
    <PublicationEditorPage
      publication={publication}
      onBack={() => navigate('/publications')}
      onSave={(values) => {
        onSave(publicationId, values)
        navigate('/publications')
      }}
    />
  )
}

export function PublicationsRoutes(): ReactElement {
  const navigate = useNavigate()
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

  function handleSavePublication(
    publicationId: string,
    values: PublicationEditorValues,
  ) {
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
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/publications" replace />}
      />

      <Route
        path="/publications"
        element={
          <PublicationsPage
            publications={publications}
            isCreating={isCreating}
            onCreate={() => setIsCreating(true)}
            onCancelCreate={() => setIsCreating(false)}
            onSubmitCreate={handleSubmitCreate}
            onOpen={(publicationId) =>
              navigate(
                `/publications/${encodeURIComponent(
                  publicationId,
                )}/edit`,
              )
            }
          />
        }
      />

      <Route
        path="/publications/:publicationId/edit"
        element={
          <PublicationEditorRoute
            publications={publications}
            onSave={handleSavePublication}
          />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/publications" replace />}
      />
    </Routes>
  )
}
