# ADR-0015: Fillable PDF coordinate plan

## Status

Accepted

## Context

The fillable-PDF serializer needs deterministic widget coordinates that agree with the same automatic pagination model used by preview and static export. Computing placement independently inside a PDF library would create a second layout engine and make field positions difficult to test.

## Decision

Extend the library-independent `PublicationPdfPlan` with point-based block placements and interactive-field rectangles before binary serialization is introduced.

The plan uses:

- US Letter: 612 × 792 points;
- fixed Gentle Page margins: 54 points;
- a 24-point page-number reserve;
- 504-point content width;
- 660-point content height.

The existing publication pagination estimator becomes a shared exported function. PDF block heights are derived from those same capacity units, so pagination and coordinate planning cannot silently diverge.

Coordinates use standard PDF bottom-left origin semantics.

Multiline text fields receive a full-width widget rectangle below a reserved prompt area. Checkbox fields receive a compact square widget rectangle at the start of their block placement.

## Consequences

The eventual PDF library consumes explicit geometry rather than deciding editorial layout.

Field placement can be tested without generating PDF bytes.

The coordinate plan remains deterministic and replaceable. Future measurement-based pagination can update the shared layout estimator without changing publication persistence or interactive block types.
