# Roadmap

The Gentle Page Studio is moving from platform foundation into editorial production: turning structured publication content into page-based, printable products.

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
- [x] Heading blocks with semantic levels
- [x] Paragraph blocks
- [x] Add and remove blocks
- [x] Move blocks up and down
- [x] Duplicate blocks
- [x] Preserve block values and order
- [x] Return Published publications to Draft after content edits
- [x] Render saved content in preview

## 4. Editorial document foundation — next

MVP defaults are locked: US Letter, portrait, fixed Gentle Page margins, automatic pagination, bottom-center page numbers, fixed Gentle Page typography, and a fixed Gentle Page cover as page one.

- [ ] Add durable document settings defaults
- [ ] Introduce page-based publication structure
- [ ] Add US Letter portrait geometry and Gentle Page safe area
- [ ] Add Gentle Page document typography tokens
- [ ] Build print-oriented document preview
- [ ] Add automatic content flow and deterministic page breaks
- [ ] Add fixed cover rendering
- [ ] Add bottom-center page numbering

## 5. Product export — upcoming

- [ ] Print stylesheet and print validation
- [ ] Static PDF export foundation
- [ ] Validate the first complete Gentle Page journal end to end
- [ ] Add explicit fillable field blocks after static export is stable
- [ ] Add first fillable PDF export with multiline text and checkbox fields

## 6. Studio evolution — later

- [ ] Publication revision model based on immutable publish snapshots
- [ ] Version history and restore-as-new-draft flow
- [ ] Compare revisions
- [ ] Autosave and draft recovery
- [ ] Templates
- [ ] Asset library
- [ ] Authentication and backend synchronization
- [ ] Multiple export formats
- [ ] Publishing/distribution workflows
- [ ] AI-assisted creation

See `BACKLOG.md` for prioritized implementation work and ADR-0006 for the accepted editorial-output defaults.
