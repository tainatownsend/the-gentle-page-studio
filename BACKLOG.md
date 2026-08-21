# Backlog

This backlog separates work that has already been processed, implementation-ready work, and intentionally deferred items.

## Processed in PR0027A

### Engineering quality

- [x] **Unified quality command**
  - `npm run quality` runs lint, tests, and production build
  - GitHub Actions uses the same command as the local workflow

- [x] **Snapshot-first repair workflow**
  - when a format-sensitive implementation script fails, capture the exact affected files before producing a repair script
  - prefer deterministic rewrites over repeated heuristic patching
  - contributor guidance documents the workflow

- [x] **Test interaction guidance**
  - use deterministic input events when character-by-character typing behavior is not itself under test
  - reserve browser-like interaction helpers for behavior where interaction sequencing matters

- [x] **Roadmap refresh**
  - replace the stale foundation-era roadmap with the actual Studio state
  - make the transition into editorial production explicit

### Product decisions resolved for the editorial foundation

- [x] **Primary page size:** US Letter
- [x] **Orientation:** portrait only for the MVP
- [x] **Margins / safe area:** fixed Gentle Page defaults for the MVP
- [x] **Pagination:** automatic content flow for the MVP
- [x] **Page numbering:** bottom center
- [x] **Typography:** fixed Gentle Page identity for the MVP
- [x] **Cover model:** a fixed Gentle Page cover generated as the first publication page
- [x] **Brand customization:** Gentle Page identity only for the MVP

## Processed in PR0027B

### Editorial document foundation

- [x] **Document settings domain model**
  - durable US Letter page settings
  - portrait-only MVP orientation
  - fixed 0.75 inch Gentle Page margins / safe area
  - defaults independent from the UI
  - version 3 persistence migration and fixtures
  - independent settings for new and duplicated publications

## Processed in PR0027C

### Derived layout and preview

- [x] **Automatic page layout foundation**
  - authored content remains a semantic ordered stream
  - output pages are derived rather than persisted
  - preview/export share a `PublicationLayout` projection boundary
  - layout data is copied independently from persisted publication data
  - future measurement-based pagination can replace the initial single-page projection without a storage migration

- [x] **Print-oriented preview shell**
  - responsive US Letter portrait canvas
  - stable 8.5:11 page proportions
  - document geometry scales on narrow screens without changing its ratio
  - page size and orientation are exposed on the page surface
  - bottom-center page-number area is reserved and rendered

## Processed in PR0027D

### Gentle Page editorial identity

- [x] **Typography settings foundation**
  - dedicated publication typography tokens
  - publication typography separated from Studio UI `Text` primitives
  - semantic native document headings and paragraphs
  - fixed Gentle Page display/body typography for the MVP

- [x] **Cover foundation**
  - fixed Gentle Page cover generated as the first derived page
  - cover title and description derived from publication metadata
  - Gentle Page brand name and tagline included
  - cover remains unnumbered
  - content numbering begins at page 1

## Processed in PR0027E

### Automatic multi-page flow

- [x] **Automatic multi-page flow refinement**
  - deterministic content-capacity estimation derives additional pages
  - page boundaries remain outside persisted publication data
  - stable block order is preserved across pages
  - complete blocks move to the next page instead of being split
  - oversized single blocks remain intact for future measurement-based refinement
  - content pages receive sequential numbering after the unnumbered cover

## Ready to implement next

### Editorial document foundation

1. **Print stylesheet foundation**
   - create print-only layout rules
   - remove Studio chrome from printed output
   - establish deterministic page breaks
   - preserve US Letter geometry
   - force publication paper/ink colors suitable for print

2. **Static PDF export foundation**
   - expose a clear Print / Save as PDF action from preview
   - make the print-oriented document suitable for browser PDF export
   - validate page geometry, page numbers, cover, and content flow
   - treat static PDF as the first export milestone

## Architectural note on automatic pagination

The MVP uses automatic pagination, so authored content remains a semantic ordered stream rather than storing manual page boundaries in the publication domain. Page objects belong to the derived editorial layout used by preview and export. This avoids persisting layout artifacts that would become stale whenever typography, margins, or content changes.

## Recommended later decisions

### Fillable output

Defer fillable PDF until the static PDF path is stable. When introduced, start with the smallest useful set:

- multiline text field
- checkbox
- author them as explicit field blocks in the editor rather than inferring fields during export

Short text, radio/select, date, and additional field types can follow after the first fillable workflow is validated.

### Versioning

Use publish events as the version boundary:

- each explicit publish creates an immutable published snapshot
- ordinary draft saves do not create versions
- retain all published snapshots locally during the MVP
- restoring a historical version creates a new draft rather than overwriting current history

This keeps the initial versioning model understandable while preserving a durable record of what was actually published.

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
