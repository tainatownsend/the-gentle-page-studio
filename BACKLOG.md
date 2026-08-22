# Backlog

This backlog reflects the consolidated MVP release candidate in `release/mvp-manual-acceptance` / PR0028.

## Implemented in the MVP release candidate

### Platform and quality

- [x] project architecture and design-system foundation
- [x] light/dark theme support
- [x] unified `npm run quality` gate
- [x] snapshot-first repair workflow
- [x] deterministic test interaction guidance
- [x] repository hygiene cleanup
- [x] reviewed high-severity dependency remediation without forced upgrades
- [x] weekly Dependabot npm maintenance
- [x] lazy loading of the fillable-PDF serializer

### Publication lifecycle

- [x] local publication persistence and migrations
- [x] dedicated publication creation route
- [x] Draft / Published lifecycle
- [x] edit, save, duplicate, delete, and preview flows
- [x] unsaved-change protection
- [x] autosave and best-effort draft recovery
- [x] recovery invalidation when the canonical saved publication is newer

### Content authoring

- [x] heading blocks
- [x] paragraph blocks
- [x] multiline response fields
- [x] checkbox fields
- [x] add, remove, duplicate, and move block controls
- [x] heading levels
- [x] starter templates: Blank publication, Guided journal, and Daily check-in

### Editorial document output

- [x] US Letter portrait defaults
- [x] fixed Gentle Page margins
- [x] Gentle Page cover and typography
- [x] automatic derived pagination
- [x] bottom-center page numbers
- [x] print-oriented preview
- [x] static browser Print / Save as PDF

### Fillable PDF

- [x] deterministic PDF layout planning
- [x] stable interactive field identities
- [x] binary `pdf-lib` serializer
- [x] multiline AcroForm text fields
- [x] AcroForm checkboxes
- [x] deterministic download filenames
- [x] browser Download fillable PDF action
- [x] export error handling and retry behavior
- [x] duplicate-export protection

### Publication history

- [x] immutable snapshots on explicit publish transitions
- [x] local revision persistence
- [x] version history UI
- [x] restore historical version as a new Draft
- [x] deterministic revision comparison
- [x] adjacent published-version comparison UI

### Studio assets

- [x] local image asset library
- [x] PNG, JPEG, and WebP upload validation
- [x] local persistence and preview
- [x] permanent asset deletion

## Current release gate — manual acceptance

Run `docs/MVP_ACCEPTANCE.md` against PR0028.

The MVP remains a release candidate until browser and real PDF-viewer acceptance is complete.

Required manual evidence:

1. publication creation and template smoke test
2. autosave/recovery smoke test
3. editor and automatic-pagination smoke test
4. local asset-library smoke test
5. static Print / Save as PDF validation
6. fillable PDF download, edit, save, close, reopen, and print validation
7. version history, comparison, and restore validation
8. light/dark and desktop/narrow viewport smoke test

Acceptance outcome must be one of:

- **PASS**
- **PASS WITH FOLLOW-UP** with no blocking defects
- **FAIL** with reproducible blocking defects recorded

## Follow-up only if acceptance exposes a defect

- [ ] remediate reproducible browser print incompatibilities
- [ ] remediate reproducible PDF-viewer compatibility issues
- [ ] adjust pagination or field geometry only when a real acceptance case demonstrates a problem

## Post-MVP evolution

These items are intentionally outside the current manual-acceptance gate:

- authentication
- backend synchronization
- collaboration
- cloud asset storage
- placing library assets directly into publication pages
- additional fillable field types
- richer text formatting
- drag-and-drop block reordering
- keyboard shortcuts for block movement
- bulk block selection
- user-selectable page sizes and orientation
- custom margins
- manual pagination
- custom page-number placement
- per-publication visual themes
- customizable cover layouts
- multiple export formats
- publishing/distribution integrations
- scheduled publishing
- AI-assisted creation

## Architectural notes

Authored content remains a semantic ordered stream. Page objects belong to derived layout used by preview and export, preventing persisted page boundaries from becoming stale after content or typography changes.

Explicit publish creates an immutable snapshot; ordinary Draft saves do not create versions; restore creates a new Draft rather than rewriting history.

Reader response data remains outside publication authoring state. Fillable PDF fields are output controls derived from durable authored blocks.
