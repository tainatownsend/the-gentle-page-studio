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

### Revision comparison foundation

- [x] **Deterministic revision diff** — compares two immutable snapshots without mutating either revision.
- [x] **Metadata comparison** — reports title and description changes.
- [x] **Durable block comparison** — reports block additions, removals, content/type changes, and movement using stable block IDs.
- [x] **Regression coverage** — covers equivalent snapshots plus mixed metadata and block changes.
- [x] **Roadmap synchronization** — reflects the actual implementation status through fillable export and revision comparison.

## Ready to implement next

### Revision comparison UI

1. add a Compare action to published version history
2. select two revisions deterministically
3. render metadata changes separately from block changes
4. show added, removed, changed, and moved blocks without editing either snapshot
5. preserve restore-as-new-draft as a separate action
6. add route/page tests and accessibility coverage

### Dependency security follow-up

- investigate issue #60 with `npm audit --json`
- identify whether findings affect runtime or development dependencies
- apply only reviewed, non-breaking remediation
- keep PDF export behavior unchanged

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
