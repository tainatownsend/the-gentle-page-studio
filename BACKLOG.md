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

## Processed in PR0027F

### Print and static PDF foundation

- [x] **Print stylesheet foundation**
  - Studio preview controls are removed from print output
  - each output page uses exact US Letter portrait geometry
  - fixed 0.75 inch document padding is preserved
  - deterministic page breaks separate derived publication pages
  - screen-only borders, gaps, backgrounds, and shadows are removed
  - print colors are explicitly preserved

- [x] **Static PDF export foundation**
  - preview exposes `Print / Save as PDF`
  - browser native print is used as the first PDF serialization path
  - print and PDF reuse the same derived publication layout and document markup
  - no additional PDF rendering dependency is introduced for the MVP

## Ready to implement next

### Publication versioning foundation

1. **Published revision domain model**
   - capture an immutable publication snapshot on explicit transition to Published
   - do not create revisions for ordinary Draft saves
   - keep revision data independent from the editable current publication

2. **Revision persistence and history**
   - persist published revisions locally
   - retain all published snapshots for the MVP
   - expose revision history for a publication
   - restore a historical revision as a new Draft without rewriting history

### Fillable publication foundation — after static print validation

3. **Interactive content domain model**
   - add multiline text and checkbox field blocks
   - keep them explicit in the authored content model
   - preserve backward-compatible persistence migration

4. **Interactive editor and preview**
   - add editor controls for multiline fields and checkboxes
   - render field affordances in the publication preview
   - keep static print output understandable before PDF form serialization is added

5. **Fillable PDF serialization investigation**
   - evaluate whether browser print can preserve required interactivity
   - if not, introduce a PDF form library behind the existing derived publication layout
   - keep binary PDF generation separate from editorial authoring concerns

## Architectural note on automatic pagination

The MVP uses automatic pagination, so authored content remains a semantic ordered stream rather than storing manual page boundaries in the publication domain. Page objects belong to the derived editorial layout used by preview and export. This avoids persisting layout artifacts that would become stale whenever typography, margins, or content changes.

## Versioning decision

Use publish events as the version boundary:

- each explicit publish creates an immutable published snapshot
- ordinary draft saves do not create versions
- retain all published snapshots locally during the MVP
- restoring a historical version creates a new draft rather than overwriting current history

## Fillable output decision

Start with the smallest useful interactive set after the static print path is validated:

- multiline text field
- checkbox
- author both as explicit field blocks in the editor rather than inferring fields during export

Short text, radio/select, date, and additional field types can follow after the first fillable workflow is validated.

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
