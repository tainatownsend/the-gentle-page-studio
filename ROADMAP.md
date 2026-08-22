# Roadmap

The Gentle Page Studio has completed its core editorial-production foundation and is now moving through export acceptance and Studio-evolution capabilities.

## 1. Platform foundation — complete

- [x] Project structure and architecture boundaries
- [x] Semantic design tokens
- [x] Theme engine with system preference support
- [x] Foundation primitives and layouts
- [x] Publications application shell and routing
- [x] Reusable resource collection infrastructure

## 2. Publication lifecycle — complete

- [x] Publication domain model
- [x] Local persistence and storage migration
- [x] Create publication flow
- [x] Dedicated `/publications/new` route
- [x] Edit and save publication metadata
- [x] Duplicate publication
- [x] Delete publication with confirmation
- [x] Draft and Published status flow
- [x] Unsaved changes protection
- [x] Publication preview route

## 3. Content editor foundation — complete

- [x] Durable ordered content blocks
- [x] Heading and paragraph blocks
- [x] Multiline response and checkbox blocks
- [x] Add and remove blocks
- [x] Move blocks up and down
- [x] Duplicate blocks
- [x] Preserve block values and order
- [x] Return Published publications to Draft after content edits
- [x] Render saved content in preview

## 4. Editorial document foundation — complete

MVP defaults are locked: US Letter, portrait, fixed Gentle Page margins, automatic pagination, bottom-center page numbers, fixed Gentle Page typography, and a fixed Gentle Page cover as page one.

- [x] Durable document settings defaults
- [x] Derived page-based publication layout
- [x] US Letter portrait geometry and Gentle Page safe area
- [x] Gentle Page document typography tokens
- [x] Print-oriented document preview
- [x] Automatic content flow and deterministic page breaks
- [x] Fixed cover rendering
- [x] Bottom-center page numbering

## 5. Product export — implementation complete, acceptance pending

- [x] Print stylesheet and static browser PDF path
- [x] Fillable field authoring and preview
- [x] Library-independent fillable PDF planning
- [x] Binary AcroForm serializer using `pdf-lib`
- [x] Browser `Download fillable PDF` action
- [x] Recoverable fillable-export error handling
- [ ] Validate the first complete Gentle Page journal end to end in a real PDF viewer
- [ ] Record and remediate any reproducible viewer compatibility issues

## 6. Publication history — active

- [x] Immutable publish snapshots
- [x] Local revision persistence
- [x] Version history route
- [x] Restore historical version as a new Draft
- [x] Revision comparison domain utility
- [ ] Revision comparison UI

## 7. Studio evolution — later

- [ ] Autosave and draft recovery
- [ ] Templates
- [ ] Asset library
- [ ] Authentication and backend synchronization
- [ ] Multiple export formats
- [ ] Publishing/distribution workflows
- [ ] AI-assisted creation

## Engineering follow-up

- [ ] Investigate and safely remediate the high-severity dependency findings tracked in issue #60

See `BACKLOG.md` for prioritized implementation work and the ADR series for accepted architecture decisions.
