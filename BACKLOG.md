# Backlog

This backlog reflects the consolidated **Editorial North Star** release candidate in `release/editorial-north-star-manual-acceptance` / PR #99.

## Implemented in the release candidate

### Platform and quality

- [x] project architecture and design-system foundation
- [x] light/dark theme support
- [x] unified `npm run quality` gate
- [x] release-specific `npm run quality:release` gate
- [x] high-severity dependency audit enforced in GitHub Quality
- [x] snapshot-first repair workflow
- [x] deterministic test interaction guidance
- [x] reviewed dependency remediation without forced upgrades
- [x] weekly Dependabot npm maintenance
- [x] lazy loading boundary for the heavy fillable-PDF serializer

### Publication lifecycle

- [x] local publication persistence and migrations
- [x] Draft / Published lifecycle
- [x] edit, save, duplicate, delete, and preview flows
- [x] unsaved-change protection
- [x] autosave and best-effort draft recovery
- [x] immutable published revisions, comparison, and restore-as-Draft

### Publication Compiler

- [x] manuscript-first Create publication experience
- [x] Gentle Page Manuscript Protocol
- [x] official AI authoring prompt for ChatGPT / Gemini / Claude / similar tools
- [x] direct Paste → Compile → Preview flow
- [x] local `.docx` ingestion through OOXML
- [x] paragraph/table body-order preservation
- [x] Word heading and page-break intent preservation
- [x] writing-line, checkbox, table, matrix, and rating interpretation
- [x] author-only note filtering
- [x] exception-only import diagnostics
- [x] semantic table-cell response and checkbox controls
- [x] zero reader-facing Gentle Page protocol syntax after compilation

### Editorial composition

- [x] US Letter portrait publication defaults and fixed Gentle Page margins
- [x] Gentle Page publication-facing editorial design system
- [x] branded cover, hierarchy, typography, palette, rules, cards, and worksheet styling
- [x] semantic page archetypes and layout recipes
- [x] smart pagination and preferred/forced page-break intent
- [x] elastic response-field sizing
- [x] heading orphan prevention
- [x] prompt/response and checkbox grouping
- [x] repeatable-page semantics
- [x] compound journal component recognition
- [x] cross-page editorial recomposition
- [x] Visual QA diagnostics and deterministic self-healing
- [x] Brain-Friendly Planner golden acceptance automation

### Static and fillable output

- [x] print-oriented browser Preview
- [x] static browser Print / Save as PDF
- [x] deterministic shared PDF layout planning
- [x] multiline AcroForm response fields
- [x] AcroForm checkboxes
- [x] rating controls
- [x] fillable response/checkbox controls inside tables and matrices
- [x] worksheet-only publications expose fillable PDF export
- [x] export error handling and retry behavior
- [x] stable field identities

### Studio assets

- [x] local PNG / JPEG / WebP asset library
- [x] upload validation, persistence, preview, and deletion

## Current release gate — manual Editorial North Star acceptance

Run issue #73 against PR #99.

The required zero-touch path is:

**Paste / Upload → Compile → beautiful publication → Preview → Export**

Primary acceptance cases:

1. Brain-Friendly Planner generated with the current Gentle Page AI authoring prompt
2. `Burnout_Recovery_Journal_English_Draft.docx`
3. `The_30-Day_Energy_Audit_English_Draft.docx`
4. static/fillable PDF parity in a real PDF viewer
5. regression smoke test for lifecycle, recovery, history, assets, themes, and narrow/mobile UI

Acceptance outcome must be one of:

- **PASS**
- **PASS WITH FOLLOW-UP** with no blocking defect
- **FAIL** with a reproducible blocking defect

### Release-blocking defects

- manuscript content is lost
- compilation fails for representative AI or DOCX input
- `[[GP:...]]` / Markdown control syntax leaks into reader output
- clipping or overlap makes pages unusable
- structured worksheets are materially corrupted
- fillable fields are missing, unusable, or fail to preserve values
- widespread heading-only / mechanically fragmented pages remain
- ordinary publications still require page-by-page desktop-publishing work

## After acceptance

- [ ] merge PR #99 to `main` using the normal squash strategy
- [ ] close issue #60 once the accepted dependency remediation reaches `main`
- [ ] protect `main` with required Quality checks (issue #74)
- [ ] remove obsolete release branches after the accepted merge

## Post-v1 evolution

These items are intentionally outside the Editorial North Star release gate:

- authentication and backend synchronization
- collaboration
- cloud-backed asset library
- placing image assets directly into publication pages
- richer text formatting
- additional interactive field types
- configurable page sizes, orientation, margins, and themes
- multiple export formats
- publishing/distribution integrations
- scheduled publishing
- optional direct AI API integration

## Architectural rule

**AI creates the manuscript. Gentle Page creates the publication.**

Authored content remains semantic. Page composition is derived and recompilable. Manual editing is an exception/correction layer rather than the primary typesetting workflow.
