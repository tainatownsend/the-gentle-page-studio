# Backlog

This backlog separates work that has already been processed, implementation-ready work, and intentionally deferred items.

## Processed in PR0027A

### Engineering quality

- [x] **Unified quality command** — `npm run quality` runs lint, tests, and production build; CI uses the same command.
- [x] **Snapshot-first repair workflow** — exact affected files are captured before deterministic repair.
- [x] **Test interaction guidance** — deterministic input events are preferred when character-by-character typing is not under test.
- [x] **Roadmap refresh** — planning reflects the current Studio and editorial-production stage.

### Product decisions resolved for the editorial foundation

- [x] US Letter
- [x] portrait-only MVP
- [x] fixed Gentle Page margins
- [x] automatic pagination
- [x] bottom-center page numbers
- [x] fixed Gentle Page typography
- [x] fixed Gentle Page cover
- [x] Gentle Page visual identity only for the MVP

## Processed in PR0027B

- [x] **Document settings domain model** — US Letter, portrait, fixed 0.75 inch margins, v3 persistence migration, independent settings for copies.

## Processed in PR0027C

- [x] **Derived publication layout** — output pages are projected from semantic authored content rather than persisted.
- [x] **Print-oriented preview shell** — responsive Letter portrait pages with bottom-center numbering.

## Processed in PR0027D

- [x] **Gentle Page document typography** — publication-specific typography tokens and semantic document elements.
- [x] **Cover foundation** — fixed unnumbered Gentle Page cover followed by numbered content.

## Processed in PR0027E

- [x] **Automatic multi-page flow** — deterministic capacity estimation preserves complete block order across derived pages.

## Processed in PR0027F

- [x] **Print stylesheet foundation** — exact Letter geometry, fixed page breaks, print-only cleanup, preserved print colors.
- [x] **Static PDF export foundation** — `Print / Save as PDF` uses the browser-native print pipeline without a second rendering engine.

## Processed in PR0027G

- [x] **Published revision model** — immutable snapshots are created only at explicit Draft → Published transitions.
- [x] **Revision persistence and history** — local newest-first history, restore-as-new-Draft, history cleanup on permanent deletion.

## Processed in PR0027H

- [x] **Interactive content domain model** — explicit multiline text-field and checkbox-field blocks, publication persistence v4, revision persistence v2, backward migrations and validation.

## Processed in PR0027I

- [x] **Interactive editor controls** — add/edit multiline response and checkbox blocks using existing move, duplicate, delete, Draft, save, and unsaved-change behavior.
- [x] **Interactive static preview** — printable lined response areas and checkbox marks; interactive footprint participates in pagination estimates.

## Processed in PR0027J

- [x] **Fillable serialization strategy** — static browser print remains separate; `pdf-lib` selected for binary form serialization; field identity uses publication ID + durable block ID.

## Processed in PR0027K

### Fillable export planning boundary

- [x] **Library-independent field plan**
  - derives fillable fields from the existing `PublicationLayout`
  - maps only authored interactive blocks
  - records layout page sequence, content page number, and block position for each field
  - preserves prompt/label separately from stable field identity

- [x] **Deterministic field naming**
  - field names are based on publication ID and durable block ID
  - unsafe field-name characters are normalized
  - changing prompt text does not change field identity
  - static-only publications produce no fillable fields

## Ready to implement next

### Fillable PDF foundation

1. **Fillable PDF serializer foundation**
   - add `pdf-lib` at the export adapter boundary
   - create US Letter PDF pages from `PublicationLayout`
   - consume the fillable export plan rather than re-interpreting publication content
   - map multiline response fields to multiline PDF text fields
   - map checkbox fields to PDF checkboxes
   - preserve cover, content order, page numbering, margins, and Gentle Page identity

2. **Fillable export action**
   - expose `Download fillable PDF` separately from `Print / Save as PDF`
   - generate bytes in the browser and trigger a deterministic file download
   - keep the static print path unchanged

3. **Fillable export validation**
   - inspect generated AcroForm field names/types in automated tests
   - verify fields are editable in common PDF viewers
   - verify static appearance remains understandable when printed
   - verify multi-page field placement and unique field identity

## Architectural note on automatic pagination

Authored content remains a semantic ordered stream. Page objects belong to derived preview/export layout so layout changes never require manual page-boundary migrations.

## Versioning decision

Explicit publish creates an immutable snapshot; Draft saves do not version; all MVP snapshots remain local; restore creates a new Draft.

## Fillable output decision

Start with multiline text and checkbox blocks. Reader response data is not part of publication authoring state. Binary form serialization is isolated from the authoring model.

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
