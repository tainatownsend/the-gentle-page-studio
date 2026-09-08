# Roadmap

Gentle Page Studio has reached the **Editorial North Star release-candidate stage** in `release/editorial-north-star-manual-acceptance` / PR #99. The remaining release gate is manual visual and PDF-viewer acceptance tracked in issue #73.

## 1. Platform foundation — complete

- [x] project architecture and design-system foundation
- [x] theme engine and responsive application shell
- [x] publication persistence and migrations
- [x] unified lint / test / build quality gate
- [x] `npm run quality:release` with high-severity dependency audit
- [x] GitHub Quality workflow
- [x] reviewed dependency remediation and Dependabot maintenance

## 2. Publication lifecycle — complete

- [x] Draft / Published lifecycle
- [x] create, edit, save, duplicate, delete, and preview flows
- [x] unsaved-change protection
- [x] autosave and local draft recovery
- [x] immutable published revisions
- [x] version comparison and restore-as-Draft
- [x] local image asset library

## 3. Publication Compiler — complete for v1

North Star input model:

**ChatGPT / Gemini / Claude / Word / Markdown → Gentle Page Compiler**

- [x] manuscript-first creation flow
- [x] Gentle Page Manuscript Protocol
- [x] copyable AI authoring prompt
- [x] Markdown and directive parsing
- [x] direct compile-to-preview path
- [x] first-class headings, paragraphs, response fields, checkboxes, ratings, tables, and matrices
- [x] semantic table-cell controls
- [x] local DOCX / OOXML ingestion
- [x] paragraph/table document-order preservation
- [x] Word heading and page-break interpretation
- [x] writing-line and checkbox inference
- [x] author-only note filtering
- [x] exception-only import review behavior
- [x] repeatable-page semantics

## 4. Editorial composition engine — complete for v1

The compiler, not the user, is responsible for normal page composition.

- [x] US Letter portrait defaults and fixed Gentle Page margins
- [x] Gentle Page editorial typography and visual identity
- [x] branded cover
- [x] semantic page archetypes and layout recipes
- [x] smart pagination
- [x] preferred / forced page-break intent
- [x] elastic response-field sizing
- [x] heading look-ahead and orphan prevention
- [x] prompt/response and checkbox grouping
- [x] compound journal component inference
- [x] cross-page editorial recomposition
- [x] Visual QA diagnostics
- [x] deterministic safe self-healing
- [x] Brain-Friendly Planner golden acceptance gates

## 5. Static and fillable output — implementation complete

- [x] print-oriented browser Preview
- [x] browser Print / Save as PDF
- [x] deterministic PDF page plan
- [x] fillable PDF serializer using `pdf-lib`
- [x] multiline text fields
- [x] checkboxes
- [x] rating controls
- [x] fillable worksheet/table controls
- [x] stable AcroForm field names
- [x] recoverable export errors
- [x] lazy-load boundary for the heavy PDF serializer

Manual viewer acceptance is still required because automated tests cannot prove final browser print appearance or saved-field persistence across real PDF viewers.

## 6. Editorial North Star release gate — current

PR #99 remains Draft until issue #73 records **PASS** or **PASS WITH FOLLOW-UP** with no blocking defect.

Required acceptance cases:

1. zero-touch Brain-Friendly Planner from the current AI authoring prompt
2. Burnout Recovery Journal DOCX
3. 30-Day Energy Audit DOCX
4. static vs fillable PDF parity
5. real PDF-viewer field persistence
6. existing Studio regression smoke test

Release target:

**Paste / Upload → Compile → beautiful publication → Preview → Export**

The ordinary workflow should require **0 manual layout interventions**. DOCX imports may tolerate isolated semantic preferences, but never page-by-page reconstruction.

## 7. Immediately after acceptance

- [ ] squash-merge PR #99 to `main`
- [ ] close issue #60 after the accepted dependency remediation reaches `main`
- [ ] apply `main` branch protection and required Quality checks (issue #74)
- [ ] remove obsolete release branches
- [ ] tag the accepted Editorial North Star baseline

## 8. Post-v1 evolution

- [ ] authentication and backend synchronization
- [ ] collaboration
- [ ] cloud-backed asset library
- [ ] direct asset placement in publications
- [ ] richer text formatting
- [ ] additional interactive field types
- [ ] configurable page geometry and publication themes
- [ ] additional output formats
- [ ] publishing/distribution workflows
- [ ] scheduled publishing
- [ ] optional direct AI API integration

## Product rule

**AI creates the manuscript. Gentle Page creates the publication.**

The editor remains a correction/refinement layer. The product should not evolve into a smaller Canva or a Word-style page-layout tool.
