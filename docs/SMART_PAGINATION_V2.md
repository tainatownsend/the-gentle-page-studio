# Smart Pagination Engine v2

Smart Pagination v2 moves The Gentle Page Studio closer to the North Star where the compiler resolves document geometry before asking the user to intervene.

## Core rule

**Automatic layout first. Semantic correction second. Absolute positioning never.**

The pagination engine now runs in two passes:

1. **Structure pass** — place authored blocks on pages using baseline size estimates, capacity, forced/preferred breaks, and heading look-ahead.
2. **Allocation pass** — distribute remaining page capacity into multiline response fields while respecting the authored response-size intent.

This means a `short`, `medium`, or `long` response field defines a minimum writing-space intent, not a rigid rectangle. When a page has safe unused space, the engine expands response fields automatically rather than leaving unnecessary dead space.

## Semantic correction controls

The advanced editor exposes only durable intent:

- **Response size:** Short / Medium / Long
- **Page placement:** Auto / Prefer new page / Start new page

`Auto` is the default recommendation. Page placement does not store coordinates or page numbers, so the manuscript remains resilient when content is recompiled or reordered.

## Layout health

The derived layout can report non-blocking diagnostics when automatic composition cannot safely resolve a geometry problem. v2 detects:

- a single block whose baseline size exceeds one content page;
- unusually sparse non-final pages after response-field expansion.

A diagnostic is a prompt for quick review, not a failed compilation. Export remains available.

## Browser/PDF parity

The same derived block allocations drive both the browser preview and the fillable PDF plan. Response-field expansion therefore affects both surfaces from one source of truth.

## Next increments

The next engine iterations should add:

- semantic grouping for checkbox sets and worksheet units;
- first-class rating scales, tables, and matrices;
- repeatable page semantics;
- deeper multi-pass rebalancing across neighboring pages;
- benchmark fixtures for the Burnout Recovery Journal and 30-Day Energy Audit;
- optional compiler suggestions that target only unresolved exceptions.
