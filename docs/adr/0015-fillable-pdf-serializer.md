# ADR-0015: Fillable PDF serializer foundation

## Status

Accepted

## Context

The publication authoring model now supports multiline response fields and checkbox fields, and the export planning layer provides deterministic US Letter geometry, page assignments, block rectangles, and widget rectangles.

Browser `Print / Save as PDF` remains useful for static output, but it does not provide a dependable cross-viewer contract for editable AcroForm fields. Genuine fillable output therefore needs a binary PDF serializer behind the existing export planning boundary.

## Decision

Use `pdf-lib` as the first browser-compatible serializer for the MVP.

The serializer:

- consumes `Publication` through `createPublicationPdfPlan`
- creates exact 612 × 792 point US Letter pages
- preserves the fixed Gentle Page cover and numbered content-page order
- draws static headings, paragraphs, prompts, labels, and page numbers
- creates multiline AcroForm text fields from `multiline-text-field` blocks
- creates AcroForm checkboxes from `checkbox-field` blocks
- uses the stable field names supplied by the PDF plan
- uses the planned widget rectangles instead of reinterpreting layout
- returns PDF bytes without storing reader responses in Studio state

The publication domain, persistence layer, revision model, and React editor remain independent from `pdf-lib`.

## Text encoding

The initial serializer uses PDF standard fonts. Authored text is converted to a WinAnsi-safe representation before drawing so unsupported characters do not break export. Full Unicode font embedding is intentionally deferred until the first fillable workflow has been validated.

## Consequences

### Positive

- generated files contain genuine editable form fields
- field identity remains stable across prompt edits
- pagination and field placement reuse the same derived publication layout
- the static browser print path remains available independently
- the PDF dependency stays isolated inside the export layer

### Trade-offs

- standard-font output has limited Unicode coverage
- exact visual parity with browser preview is not guaranteed because the serializer is a separate rendering target
- reader/viewer compatibility still requires manual validation in common PDF applications

## Follow-up

The next product-facing step is a `Download fillable PDF` action in publication preview, followed by cross-viewer validation of multiline fields, checkboxes, pagination, printing, and saved responses.
