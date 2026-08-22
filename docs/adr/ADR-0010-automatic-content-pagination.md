# ADR-0010: Automatic content pagination

## Status

Accepted

## Context

The MVP needs automatic page flow without persisting manual page boundaries. The current publication content model contains only headings and paragraphs, which makes a deterministic semantic pagination pass possible before introducing browser measurement infrastructure.

Exact physical measurement in the DOM would add rendering lifecycle complexity and make layout tests more fragile. The first pagination implementation should preserve authored order, avoid splitting blocks, and remain replaceable.

## Decision

`PublicationLayout` paginates semantic blocks using deterministic estimated layout units.

The estimator considers block type and text length. Content accumulates into a fixed page-capacity budget; when the next block would exceed the budget, a new derived content page begins.

Blocks are never split by the paginator. A single oversized block remains intact on its own page and may overflow until a future measurement-based refinement can split or resize it safely.

Page boundaries exist only in the derived layout. Persisted publication content remains unchanged.

Content pages receive sequential page numbers beginning at 1 after the unnumbered cover.

## Consequences

Longer publications now produce multiple predictable preview pages while preserving block order.

The pagination algorithm is deterministic and can be covered with unit tests without DOM measurement.

The estimator is intentionally approximate. Print validation remains necessary, and a future measurement-based paginator can replace the estimation strategy behind the same `PublicationLayout` contract.
