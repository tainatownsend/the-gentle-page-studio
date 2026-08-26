# Roadmap

The Gentle Page Studio MVP is now consolidated in `release/mvp-manual-acceptance` / PR0028. Automated implementation work for the current MVP scope is complete; the remaining release gate is manual browser and PDF-viewer acceptance tracked in issue #73.

## 1. Platform foundation — complete

- [x] Project structure and architecture boundaries
- [x] Semantic design tokens
- [x] Theme engine with system preference support
- [x] Foundation primitives and layouts
- [x] Publications application shell and routing
- [x] Reusable resource collection infrastructure
- [x] Unified lint / test / build quality gate
- [x] Release gate combining high-severity dependency audit + quality checks
- [x] GitHub Quality enforcement of the release gate
- [x] Reviewed dependency remediation and ongoing Dependabot maintenance

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
- [x] Autosave and best-effort draft recovery

## 3. Content editor — complete for MVP

- [x] Durable ordered content blocks
- [x] Heading and paragraph blocks
- [x] Multiline response and checkbox blocks
- [x] Add and remove blocks
- [x] Move blocks up and down
- [x] Duplicate blocks
- [x] Preserve block values and order
- [x] Return Published publications to Draft after content edits
- [x] Render saved content in preview
- [x] Blank, Guided journal, and Daily check-in starter templates

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

## 5. Product export — implementation complete, manual acceptance pending

- [x] Print stylesheet and static browser PDF path
- [x] Fillable field authoring and preview
- [x] Library-independent fillable PDF planning
- [x] Binary AcroForm serializer using `pdf-lib`
- [x] Browser `Download fillable PDF` action
- [x] Recoverable fillable-export error handling
- [x] Lazy-load heavy fillable-PDF serialization code
- [ ] Execute the release-candidate browser and PDF-viewer acceptance runbook in issue #73
- [ ] Remediate only reproducible blocking compatibility defects, if any

## 6. Publication history — complete for MVP

- [x] Immutable publish snapshots
- [x] Local revision persistence
- [x] Version history route
- [x] Restore historical version as a new Draft
- [x] Revision comparison domain utility
- [x] Compare each published revision with its previous snapshot

## 7. Local asset library — complete for MVP

- [x] Asset-library route and navigation
- [x] PNG, JPEG, and WebP upload validation
- [x] Local asset persistence
- [x] Image preview and metadata
- [x] Permanent asset deletion

Direct asset placement into publication pages is intentionally post-MVP.

## 8. MVP release gate — current

PR0028 stays in Draft until `docs/MVP_ACCEPTANCE.md` / issue #73 is completed with either:

- **PASS**, or
- **PASS WITH FOLLOW-UP** and no blocking defects.

The release candidate must be validated in real browsers and PDF viewers because automated tests cannot prove viewer-specific form persistence, browser print geometry, saved-field behavior, or final print appearance.

## 9. Post-MVP Studio evolution

- [ ] Authentication and backend synchronization
- [ ] Collaboration
- [ ] Cloud-backed asset library
- [ ] Asset placement inside publications
- [ ] Additional fillable field types
- [ ] Rich text capabilities
- [ ] Configurable document geometry and visual themes
- [ ] Multiple export formats
- [ ] Publishing/distribution workflows
- [ ] Scheduled publishing
- [ ] AI-assisted creation

## Engineering follow-up

The high-severity npm audit findings tracked in issue #60 have been remediated in the release candidate without forced upgrades. The high-severity audit is now part of `npm run quality:release` and the GitHub Quality workflow. Keep issue #60 open until PR0028 is accepted and merged to `main`, then close it as part of release cleanup.

See `BACKLOG.md` for the current release gate and deferred work, `docs/MVP_ACCEPTANCE.md` for the manual acceptance runbook, and the ADR series for accepted architecture decisions.
