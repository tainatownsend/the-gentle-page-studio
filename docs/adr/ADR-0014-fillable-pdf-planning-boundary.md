# ADR-0014: Fillable PDF planning boundary

## Status

Accepted

## Context

Static browser printing is sufficient for ordinary PDF output, but multiline response fields and checkboxes need a genuine PDF form serializer to remain editable after download.

The serializer must not become a second editorial layout engine or leak PDF-library types into publication authoring, persistence, or React pages.

## Decision

Introduce a library-independent `PublicationPdfPlan` between `PublicationLayout` and binary PDF generation.

The plan owns:

- exact US Letter geometry: 612 × 792 PDF points;
- fixed Gentle Page margins: 54 points;
- a 24-point page-number reserve;
- a 504-point content width and 660-point content height;
- deterministic block placement rectangles;
- deterministic interactive widget rectangles;
- stable field names based on publication ID plus durable block ID;
- derived content-page assignment from the existing automatic pagination model.

The publication block-capacity estimator is shared between layout and PDF planning so those two projections cannot silently use different pagination assumptions.

Coordinates use standard PDF bottom-left origin semantics.

Multiline fields map to a full-width response widget below their authored prompt. Checkbox fields map to a compact square widget beside their authored label.

Browser `Print / Save as PDF` remains the static-output path. Fillable PDF is a separate future binary export action.

`pdf-lib` remains the first serializer candidate because its browser API supports creating AcroForm text fields and checkboxes, multiline text fields, page widgets, and byte serialization. The dependency will remain behind the export boundary.

## Consequences

PDF field placement can be tested before any PDF library is installed.

The eventual binary adapter consumes explicit geometry rather than interpreting publication content itself.

A future serializer can be replaced without changing the publication domain, persistence schema, editor APIs, or interactive block types.
