# Backlog

This backlog separates work that has already been processed, implementation-ready work, and intentionally deferred items.

## Processed through PR0027M

- [x] Platform quality gate, snapshot-first repair workflow, and roadmap refresh
- [x] US Letter portrait document settings with fixed Gentle Page margins
- [x] Derived page layout, print preview, typography, cover, automatic pagination, and page numbering
- [x] Static Print / Save as PDF path
- [x] Immutable published revisions with local history and restore-as-new-draft behavior
- [x] Multiline response and checkbox block model, authoring controls, and preview affordances
- [x] Fillable PDF planning with deterministic US Letter geometry and stable field identities
- [x] Binary `pdf-lib` AcroForm serializer with round-trip verification
- [x] Browser `Download fillable PDF` action with deterministic filenames
- [x] Fillable export error handling, retry behavior, and duplicate-click protection

## Processed in PR0027O

- [x] deterministic revision comparison utility
- [x] title and description comparison
- [x] added, removed, changed, and moved block detection using durable block IDs
- [x] revision comparison regression coverage
- [x] roadmap synchronization through current implementation status

## Processed in PR0027P

- [x] **Adjacent revision comparison UI** — each published version can be compared with its previous snapshot.
- [x] **Read-only change summary** — metadata and block changes are surfaced without mutating either revision.
- [x] **Restore separation** — restore-as-new-draft remains an independent action.
- [x] **Accessible comparison region** — comparison output uses explicit headings and a labeled change list.
- [x] **History-page coverage** — tests verify comparison activation and mixed revision changes.

## Ready to implement next

### Dependency security follow-up

- investigate issue #60 with `npm audit --json`
- identify whether findings affect runtime or development dependencies
- apply only reviewed, non-breaking remediation
- keep PDF export behavior unchanged

### Studio evolution candidates after MVP acceptance

- autosave and draft recovery
- templates
- asset library

## Ready to validate manually

### Fillable export acceptance

1. create a publication containing a multiline response field and a checkbox
2. download the fillable PDF from preview and verify its filename
3. open it in a common PDF viewer
4. type into multiline fields and toggle checkboxes
5. save, close, and reopen the PDF; confirm values persist
6. print/export the filled PDF and confirm cover, margins, page numbers, content order, and field appearance
7. record only reproducible viewer compatibility issues for follow-up

## Architectural notes

Authored content remains a semantic ordered stream. Page objects belong to derived layout used by preview and export, preventing persisted page boundaries from becoming stale after content or typography changes.

Explicit publish creates an immutable snapshot; Draft saves do not version; all MVP snapshots remain local; restore creates a new Draft.

Reader response data is not publication authoring state. Additional fillable field types follow only after the first fillable workflow is validated.

## Intentionally deferred

- drag-and-drop block reordering
- keyboard shortcuts for block movement
- bulk block selection
- rich text formatting
- autosave
- draft recovery
- user-selectable page sizes and orientation
- custom margins
- manual pagination
- custom page-number placement
- per-publication visual themes
- customizable cover layouts
- templates
- asset library
- authentication
- backend synchronization
- collaboration
- scheduled publishing
- distribution integrations
- AI-assisted creation
