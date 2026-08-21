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

## Ready to implement next

### Editorial document foundation

1. **Document settings domain model**
   - add durable US Letter page settings
   - set portrait as the only MVP orientation
   - define fixed Gentle Page margins / safe area
   - keep defaults independent from the UI
   - include persistence migration and fixtures

2. **Page-based publication structure**
   - introduce an explicit page layer above content blocks
   - preserve ordered blocks within each page
   - migrate existing single-stream publications safely
   - support automatic content flow into pages

3. **Print-oriented preview shell**
   - render a US Letter portrait document canvas rather than a generic content card
   - establish predictable page proportions
   - support narrow-screen scaling without changing document geometry
   - reserve a bottom-center page-number area

4. **Typography settings foundation**
   - define fixed Gentle Page document typography tokens
   - keep document typography separate from Studio UI typography

5. **Cover foundation**
   - render a fixed Gentle Page cover as the first publication page
   - derive initial cover content from publication metadata
   - defer user-customizable cover layouts

6. **Print stylesheet foundation**
   - create print-only layout rules
   - remove Studio chrome from printed output
   - establish deterministic page breaks
   - preserve US Letter geometry

7. **Static PDF export foundation**
   - make the print-oriented document suitable for browser PDF export
   - validate page geometry, page numbers, cover, and content flow
   - treat static PDF as the first export milestone

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
