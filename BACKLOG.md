# Backlog

This backlog separates work that has already been processed, work that is technically sequenced but depends on product decisions, and intentionally deferred items.

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

## Sequenced next — requires product input first

### Editorial document foundation

1. **Document settings domain model**
   - add durable page size, orientation, and margin settings
   - keep defaults independent from the UI
   - include persistence migration and fixtures

2. **Page-based publication structure**
   - introduce an explicit page layer above content blocks
   - preserve ordered blocks within each page
   - migrate existing single-stream publications safely

3. **Print-oriented preview shell**
   - render a document canvas rather than a generic content card
   - establish predictable page proportions
   - support narrow-screen scaling without changing document geometry

4. **Typography settings foundation**
   - define document-level typography options
   - keep editor controls separate from design-system primitives

5. **Print stylesheet foundation**
   - create print-only layout rules
   - remove Studio chrome from printed output
   - establish deterministic page breaks

### Product decisions required for the editorial foundation

- **Primary page size:** US Letter, A4, or another format
- **Orientation defaults:** portrait only for MVP or selectable portrait/landscape
- **Margins / safe area:** fixed Gentle Page defaults or user-configurable in MVP
- **Pagination behavior:** automatic flow, manually managed pages, or hybrid
- **Page numbering:** whether numbers are shown and where they appear
- **Typography choices:** fixed Gentle Page typography or selectable presets
- **Cover model:** cover as a special page, separate publication metadata, or template-driven artifact
- **Brand customization:** whether MVP supports only Gentle Page styling or per-publication themes

## Later — requires product input before implementation

### Fillable output

- **First interactive field types:** text, multiline text, checkbox, radio/select, date, or a smaller subset
- **Authoring experience:** explicit field blocks in the editor versus converting designated content into fields during export

### Versioning

- **Version trigger:** every save, explicit publish events, or both
- **Published snapshot rule:** whether each publish must preserve an immutable revision
- **Retention:** unlimited history or a capped number of revisions
- **Restore semantics:** restore as a new draft or overwrite the current draft

## Intentionally deferred

- drag-and-drop block reordering
- keyboard shortcuts for block movement
- bulk block selection
- rich text formatting
- autosave
- draft recovery
- templates
- asset library
- authentication
- backend synchronization
- collaboration
- scheduled publishing
- distribution integrations
- AI-assisted creation
