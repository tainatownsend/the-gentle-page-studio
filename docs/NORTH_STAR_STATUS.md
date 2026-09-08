# Gentle Page Studio — Editorial North Star Status

## North Star

**Paste / Upload → Compile → beautiful publication → Preview → Export**

Gentle Page Studio is a **publication compiler**. The user supplies a manuscript; the compiler interprets semantic intent, creates publication blocks, composes pages, applies the Gentle Page editorial system, and produces static/fillable output.

The user should correct exceptions, not typeset the publication page by page.

## Current release candidate

- Branch: `release/editorial-north-star-manual-acceptance`
- Pull request: #99
- Release state: Draft, awaiting manual visual/PDF acceptance
- Acceptance tracker: issue #73

## Implemented

### Manuscript ingestion

- manuscript-first publication creation
- Gentle Page Manuscript Protocol
- official AI authoring prompt
- Markdown headings, paragraphs, checkboxes, tables, and directives
- local DOCX / OOXML ingestion
- paragraph/table body-order preservation
- Word heading and page-break intent
- writing-line and checkbox inference
- author-only note filtering
- exception-only import diagnostics

### Semantic publication model

- headings and paragraphs
- short / medium / long response fields
- checkbox fields and grouped checkbox intent
- ratings
- first-class tables and matrices
- response and checkbox controls inside structured table cells
- prompt/response semantic grouping
- repeatable-page semantics
- preferred and forced page-break intent

### Editorial composition

- US Letter portrait publication defaults
- fixed Gentle Page margins
- Gentle Page editorial typography, cover, palette, and hierarchy
- semantic page archetypes and layout recipes
- smart pagination
- elastic response-field sizing
- heading look-ahead / orphan prevention
- compound journal component inference
- cross-page editorial recomposition
- Visual QA diagnostics
- deterministic safe self-healing
- focused adjustment links for unresolved diagnostics

### Output

- browser Preview
- static Print / Save as PDF
- fillable PDF with AcroForm fields
- multiline responses
- checkboxes
- ratings
- structured worksheet/table fields
- stable field identities
- worksheet-only fillable export detection
- lazy binary PDF serializer boundary

### Existing Studio capabilities

- Draft / Published lifecycle
- autosave and local recovery
- publication duplication/deletion
- immutable revision history
- version comparison and restore-as-Draft
- local image asset library
- light/dark and responsive application UI

## Automated release evidence

The release stack includes automated gates for:

- high-severity dependency audit
- lint
- full Vitest suite
- TypeScript production build
- compiler protocol cleanup
- structured DOCX behavior
- smart pagination
- repeatable pages
- compound journal components
- editorial recomposition
- Visual QA / self-healing
- Brain-Friendly Planner golden acceptance
- static structured worksheet controls
- fillable AcroForm controls inside tables/matrices

## Remaining release gate

No further speculative layout tuning should be promoted before the zero-touch manual acceptance result is inspected.

Manual acceptance must evaluate:

1. a fresh Brain-Friendly Planner generated with the current AI authoring prompt;
2. `Burnout_Recovery_Journal_English_Draft.docx`;
3. `The_30-Day_Energy_Audit_English_Draft.docx`;
4. static and fillable PDF parity in a real viewer;
5. existing Studio regression behaviors.

### Release target

- no manuscript content loss
- no protocol syntax leakage
- no clipping/overlap
- no widespread heading-only or mechanically sparse pages
- no catastrophic prompt/field separation
- structured worksheets remain usable
- fillable fields preserve values
- **0 manual layout interventions** for the optimized AI/Protocol path
- DOCX imports require, at most, isolated semantic preference changes rather than page-by-page reconstruction

## Product direction

**AI creates the manuscript. Gentle Page creates the publication.**

The editor is an exception/correction layer. The compiler and layout engine remain semantic and recompilable rather than storing fragile absolute page geometry.
