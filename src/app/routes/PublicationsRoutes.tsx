import { useEffect, type ReactElement } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { AssetsPage } from '@/studio/assets'
import {
  PublicationCreatePage,
  PublicationEditorPage,
  PublicationHistoryPage,
  PublicationPreviewPage,
  PublicationsPage,
  clearPublicationDraftRecovery,
  loadPublicationDraftRecovery,
  savePublicationDraftRecovery,
  usePublicationsWorkspace,
  type PublicationCreateValues,
  type PublicationEditorValues,
  type PublicationsWorkspace,
} from '@/studio/publications'

type PublicationRouteWorkspace = Pick<PublicationsWorkspace, 'getPublication' | 'updatePublication'>

type PublicationEditorRouteProps = {
  workspace: PublicationRouteWorkspace
}

function PublicationEditorRoute({ workspace }: PublicationEditorRouteProps): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { publicationId } = useParams()
  const publication = workspace.getPublication(publicationId)
  const focusBlockId = searchParams.get('focus') ?? undefined
  const focusBlockIndex = focusBlockId
    ? (publication?.content.blocks.findIndex((block) => block.id === focusBlockId) ?? -1)
    : -1

  useEffect(() => {
    if (focusBlockIndex < 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const blockList = document.querySelector('[aria-label="Publication content blocks"]')
      const blockItem = blockList?.children.item(focusBlockIndex) as HTMLElement | null

      if (!blockItem) {
        return
      }

      blockItem.scrollIntoView?.({ behavior: 'smooth', block: 'center' })

      const firstControl = blockItem.querySelector<HTMLElement>('textarea, input, select, button')
      firstControl?.focus()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [focusBlockIndex])

  if (!publication || !publicationId) {
    return <Navigate to="/publications" replace />
  }

  const resolvedPublicationId = publicationId
  const baseUpdatedAt = publication.updatedAt
  const recoveredDraft = loadPublicationDraftRecovery(resolvedPublicationId, baseUpdatedAt)

  function handleSave(values: PublicationEditorValues) {
    workspace.updatePublication(resolvedPublicationId, values)
    clearPublicationDraftRecovery(resolvedPublicationId)
    navigate('/publications')
  }

  function handleDraftAutosave(values: PublicationEditorValues) {
    savePublicationDraftRecovery(resolvedPublicationId, baseUpdatedAt, values)
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
      onEdit={(blockId) =>
        navigate(
          `/publications/${encodedPublicationId}/edit${
            blockId ? `?focus=${encodeURIComponent(blockId)}` : ''
          }`,
        )
      }
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

function PublicationHistoryRoute({ workspace }: PublicationHistoryRouteProps): ReactElement {
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
    const encodedPublicationId = encodeURIComponent(publication.id)

    navigate(
      values.creationMode === 'compiled'
        ? `/publications/${encodedPublicationId}/preview`
        : `/publications/${encodedPublicationId}/edit`,
    )
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
            onOpen={(id) => navigate(`/publications/${encodeURIComponent(id)}/edit`)}
            onPreview={(id) => navigate(`/publications/${encodeURIComponent(id)}/preview`)}
            onDuplicate={workspace.duplicatePublication}
            onDelete={workspace.deletePublication}
          />
        }
      />

      <Route path="/assets" element={<AssetsPage onBack={() => navigate('/publications')} />} />

      <Route
        path="/publications/new"
        element={
          <PublicationCreatePage onBack={() => navigate('/publications')} onCreate={handleCreate} />
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
