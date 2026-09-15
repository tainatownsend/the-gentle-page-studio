# ADR-0011: Browser print and static PDF export

## Status

Accepted

## Context

The first export milestone is a static PDF. The Studio already renders a page-oriented publication preview with US Letter geometry, a cover, content pages, and numbering.

Generating PDF binaries inside the application would introduce a PDF library and a second layout engine before the browser print path has been validated. For the MVP, the lowest-complexity path is to use the browser's native print pipeline and its Save as PDF destination.

## Decision

The publication preview exposes a `Print / Save as PDF` action that invokes the browser print dialog.

A dedicated print stylesheet:

- hides Studio navigation and preview controls;
- removes screen-only backgrounds, borders, gaps, and shadows;
- fixes each publication page to 8.5 × 11 inches;
- applies 0.75 inch document padding;
- defines `@page` as Letter portrait with zero browser page margin;
- forces page breaks between derived publication pages;
- preserves print colors explicitly;
- keeps the final page from creating an unnecessary trailing break.

The browser is responsible for PDF serialization. The Studio remains responsible for deterministic printable HTML and CSS geometry.

## Consequences

The MVP can produce a static PDF without adding a PDF-generation dependency or maintaining two independent rendering implementations.

Print output and on-screen preview share the same semantic document structure.

Browser print settings still affect final output. End-to-end validation must confirm Letter size, scale at 100%, background graphics where applicable, cover behavior, page numbering, and page breaks in supported browsers.

A future direct-download PDF generator can reuse the derived publication layout if browser print becomes insufficient.
