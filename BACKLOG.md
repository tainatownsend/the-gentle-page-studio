# Backlog

This backlog separates implementation-ready work from product decisions that should be resolved before code is written.

## Ready to implement

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

### Engineering quality

6. **Unified quality command**
   - `npm run quality` runs lint, tests, and production build

7. **Snapshot-first repair workflow**
   - when a format-sensitive implementation script fails, capture the exact affected files before producing a repair script
   - prefer deterministic rewrites over repeated heuristic patching

8. **Test interaction guidance**
   - use deterministic input events when character-by-character typing behavior is not itself under test
   - reserve `userEvent` for interactions where browser-like sequencing matters

## Requires product input before implementation

### Page and print decisions

- **Primary page size:** US Letter, A4, or another format
- **Orientation defaults:** portrait only for MVP or selectable portrait/landscape
- **Margins / safe area:** fixed Gentle Page defaults or user-configurable in MVP
- **Pagination behavior:** automatic flow, manually managed pages, or hybrid
- **Page numbering:** whether numbers are shown and where they appear

### Visual publication system

- **Typography choices:** fixed Gentle Page typography or selectable presets
- **Cover model:** cover as a special page, separate publication metadata, or template-driven artifact
- **Brand customization:** whether MVP supports only Gentle Page styling or per-publication themes

### Fillable output

- **First interactive field types:** text, multiline text, checkbox, radio/select, date, or a smaller subset
- **Authoring experience:** explicit field blocks in the editor versus converting designated content into fields during export

### Versioning

- **Version trigger:** every save, explicit publish events, or both
- **Published snapshot rule:** whether each publish must preserve an immutable revision
- **Retention:** unlimited history or a capped number of revisions
- **Restore semantics:** restore as a new draft or overwrite the current draft

## Later / intentionally deferred

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
