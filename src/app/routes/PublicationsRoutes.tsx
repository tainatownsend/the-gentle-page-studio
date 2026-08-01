import type { ReactElement } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import {
  PublicationEditorPage,
  PublicationPreviewPage,
  PublicationsPage,
  usePublicationsWorkspace,
  type PublicationEditorValues,
  type PublicationsWorkspace,
} from '@/studio/publications'

type PublicationRouteWorkspace = Pick<PublicationsWorkspace, 'getPublication' | 'updatePublication'>

type PublicationEditorRouteProps = {
  workspace: PublicationRouteWorkspace
}

function PublicationEditorRoute({ workspace }: PublicationEditorRouteProps): ReactElement {
  const navigate = useNavigate()
  const { publicationId } = useParams()

  const publication = workspace.getPublication(publicationId)

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  const resolvedPublicationId = publicationId

  function handleSave(values: PublicationEditorValues) {
    workspace.updatePublication(resolvedPublicationId, values)
    navigate('/publications')
  }

  return (
    <PublicationEditorPage
      publication={publication}
      onBack={() => navigate('/publications')}
      onSave={handleSave}
    />
  )
}

type PublicationPreviewRouteProps = {
  workspace: Pick<PublicationsWorkspace, 'getPublication'>
}

function PublicationPreviewRoute({ workspace }: PublicationPreviewRouteProps): ReactElement {
  const navigate = useNavigate()
  const { publicationId } = useParams()

  const publication = workspace.getPublication(publicationId)

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  const encodedPublicationId = encodeURIComponent(publicationId)

  return (
    <PublicationPreviewPage
      publication={publication}
      onBack={() => navigate('/publications')}
      onEdit={() => navigate(`/publications/${encodedPublicationId}/edit`)}
    />
  )
}

export function PublicationsRoutes(): ReactElement {
  const navigate = useNavigate()
  const workspace = usePublicationsWorkspace()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/publications" replace />} />

      <Route
        path="/publications"
        element={
          <PublicationsPage
            publications={workspace.publications}
            isCreating={workspace.isCreating}
            onCreate={workspace.startCreating}
            onCancelCreate={workspace.cancelCreating}
            onSubmitCreate={workspace.createDraft}
            onOpen={(publicationId) =>
              navigate(`/publications/${encodeURIComponent(publicationId)}/edit`)
            }
            onPreview={(publicationId) =>
              navigate(`/publications/${encodeURIComponent(publicationId)}/preview`)
            }
            onDuplicate={workspace.duplicatePublication}
            onDelete={workspace.deletePublication}
          />
        }
      />

      <Route
        path="/publications/:publicationId/edit"
        element={<PublicationEditorRoute workspace={workspace} />}
      />

      <Route
        path="/publications/:publicationId/preview"
        element={<PublicationPreviewRoute workspace={workspace} />}
      />

      <Route path="*" element={<Navigate to="/publications" replace />} />
    </Routes>
  )
}
