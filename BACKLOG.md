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

- [x] **Document settings domain model** — US Letter, portrait, fixed 0.75 inch margins, v3 persistence migration, independent settings for copies.

## Processed in PR0027C

- [x] **Derived publication layout** — page layout is projected from semantic authored content instead of persisted.
- [x] **Print-oriented preview shell** — responsive Letter portrait pages with bottom-center numbering.

## Processed in PR0027D

- [x] **Gentle Page document typography** — publication-specific typography tokens and semantic document elements.
- [x] **Cover foundation** — fixed unnumbered Gentle Page cover followed by numbered content.

## Processed in PR0027E

- [x] **Automatic multi-page flow** — deterministic page-capacity estimation preserves complete block order across derived pages.

## Processed in PR0027F

- [x] **Print stylesheet foundation** — exact Letter geometry, fixed page breaks, print-only cleanup, preserved print colors.
- [x] **Static PDF export foundation** — `Print / Save as PDF` uses the browser-native print pipeline without a second rendering engine.

## Processed in PR0027G

### Publication versioning

- [x] **Published revision domain model**
  - explicit Draft → Published transitions create immutable snapshots
  - ordinary Draft saves do not create revisions
  - saving an already Published publication as Published does not create duplicate history
  - publishing again after returning to Draft creates a new revision

- [x] **Revision persistence and history**
  - revisions persist independently from editable publications
  - all published snapshots are retained locally for the MVP
  - `/publications/:publicationId/history` exposes newest-first history
  - restoring a revision creates a new Draft and preserves historical snapshots
  - permanent publication deletion also removes its associated local history

## Processed in PR0027H

### Fillable publication domain foundation

- [x] **Interactive content domain model**
  - adds explicit multiline text-field blocks
  - adds explicit checkbox-field blocks
  - keeps interactive prompts in the same ordered semantic content stream as headings and paragraphs
  - advances publication persistence to version 4 while retaining v1-v3 migration support
  - advances revision persistence to version 2 while retaining v1 migration support
  - validates interactive blocks before hydration

## Processed in PR0027I

### Interactive publication preview

- [x] **Interactive field preview foundation**
  - multiline response fields render an authored prompt and lined response area
  - checkbox fields render a printable checkbox and authored label
  - static print output remains understandable before binary form-field serialization
  - interactive blocks remain part of the derived publication layout and automatic pagination flow

## Processed in PR0027J

### Interactive publication authoring

- [x] **Interactive editor controls**
  - authors can add multiline response fields and checkbox fields
  - prompts and checkbox labels are edited explicitly in the publication editor
  - interactive edits participate in existing normalization, unsaved-changes protection, duplication, movement, deletion, and Draft transition behavior
  - focused tests cover authoring, normalization, and Published → Draft behavior

## Ready to implement next

### Fillable PDF foundation

1. **Interactive pagination calibration**
   - account for the fixed visual height of multiline response areas when deriving content pages
   - account for checkbox field height explicitly rather than treating all non-heading blocks like paragraphs
   - preserve deterministic page boundaries before binary PDF serialization

2. **Fillable PDF serialization investigation**
   - treat browser print as the static-output path
   - evaluate maintained JavaScript/TypeScript PDF form libraries for direct AcroForm generation
   - map the existing derived Letter layout to PDF point coordinates
   - preserve cover, page numbering, typography hierarchy, multiline fields, and checkboxes
   - keep binary PDF generation behind the publication layout boundary rather than coupling it to the editor

3. **Binary fillable PDF export foundation**
   - add a dedicated fillable-PDF export action only after serializer feasibility is validated
   - generate multiline text widgets and checkbox widgets from explicit interactive publication blocks
   - leave static `Print / Save as PDF` available as a separate export path

## Architectural note on automatic pagination

The MVP uses automatic pagination, so authored content remains a semantic ordered stream rather than storing manual page boundaries in the publication domain. Page objects belong to the derived editorial layout used by preview and export. This avoids persisting layout artifacts that would become stale whenever typography, margins, or content changes.

## Versioning decision

Use publish events as the version boundary: explicit publish creates an immutable snapshot, Draft saves do not version, all MVP snapshots remain local, and restore creates a new Draft.

## Fillable output decision

Start with multiline text and checkbox blocks authored explicitly in the editor. Additional interactive field types follow only after the first fillable workflow is validated.

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
