import type { ReactElement } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { AssetsPage } from '@/studio/assets'
import {
  clearPublicationDraftRecovery,
  loadPublicationDraftRecovery,
  PublicationCreatePage,
  PublicationEditorPage,
  PublicationHistoryPage,
  PublicationPreviewPage,
  PublicationsPage,
  savePublicationDraftRecovery,
  usePublicationsWorkspace,
  type PublicationCreateValues,
  type PublicationEditorValues,
  type PublicationsWorkspace,
} from '@/studio/publications'

type PublicationRouteWorkspace = Pick<
  PublicationsWorkspace,
  'getPublication' | 'updatePublication'
>

type PublicationEditorRouteProps = {
  workspace: PublicationRouteWorkspace
}

function PublicationEditorRoute({
  workspace,
}: PublicationEditorRouteProps): ReactElement {
  const navigate = useNavigate()
  const { publicationId } = useParams()
  const publication = workspace.getPublication(publicationId)

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  const resolvedPublicationId = publicationId
  const publicationUpdatedAt = publication.updatedAt
  const recoveredDraft = loadPublicationDraftRecovery(publication.id, publicationUpdatedAt)

  function handleSave(values: PublicationEditorValues) {
    workspace.updatePublication(resolvedPublicationId, values)
    clearPublicationDraftRecovery(resolvedPublicationId)
    navigate('/publications')
  }

  function handleDraftAutosave(values: PublicationEditorValues) {
    savePublicationDraftRecovery(resolvedPublicationId, publicationUpdatedAt, values)
  }

  return (
    <PublicationEditorPage
      publication={publication}
      recoveredDraft={recoveredDraft}
      onBack={() => navigate('/publications')}
      onSave={handleSave}
      onDraftAutosave={handleDraftAutosave}
      onDraftDiscard={() => clearPublicationDraftRecovery(resolvedPublicationId)}
    />
  )
}

type PublicationPreviewRouteProps = {
  workspace: Pick<PublicationsWorkspace, 'getPublication'>
}

function PublicationPreviewRoute({
  workspace,
}: PublicationPreviewRouteProps): ReactElement {
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
      onHistory={() => navigate(`/publications/${encodedPublicationId}/history`)}
    />
  )
}

type PublicationHistoryRouteProps = {
  workspace: Pick<
    PublicationsWorkspace,
    'getPublication' | 'getPublicationRevisions' | 'restorePublicationRevision'
  >
}

function PublicationHistoryRoute({
  workspace,
}: PublicationHistoryRouteProps): ReactElement {
  const navigate = useNavigate()
  const { publicationId } = useParams()
  const publication = workspace.getPublication(publicationId)

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  const encodedPublicationId = encodeURIComponent(publicationId)
  const revisions = workspace.getPublicationRevisions(publicationId)

  function handleRestore(revisionId: string) {
    const restoredDraft = workspace.restorePublicationRevision(revisionId)

    if (!restoredDraft) {
      return
    }

    navigate(`/publications/${encodeURIComponent(restoredDraft.id)}/edit`)
  }

  return (
    <PublicationHistoryPage
      publication={publication}
      revisions={revisions}
      onBack={() => navigate(`/publications/${encodedPublicationId}/preview`)}
      onRestore={handleRestore}
    />
  )
}

export function PublicationsRoutes(): ReactElement {
  const navigate = useNavigate()
  const workspace = usePublicationsWorkspace()

  function handleCreate(values: PublicationCreateValues) {
    const publication = workspace.createDraft(values)

    navigate(`/publications/${encodeURIComponent(publication.id)}/edit`)
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/publications" replace />} />

      <Route
        path="/publications"
        element={
          <PublicationsPage
            publications={workspace.publications}
            onCreate={() => navigate('/publications/new')}
            onAssets={() => navigate('/assets')}
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

      <Route path="/assets" element={<AssetsPage onBack={() => navigate('/publications')} />} />

      <Route
        path="/publications/new"
        element={
          <PublicationCreatePage
            onBack={() => navigate('/publications')}
            onCreate={handleCreate}
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

      <Route
        path="/publications/:publicationId/history"
        element={<PublicationHistoryRoute workspace={workspace} />}
      />

      <Route path="*" element={<Navigate to="/publications" replace />} />
    </Routes>
  )
}
