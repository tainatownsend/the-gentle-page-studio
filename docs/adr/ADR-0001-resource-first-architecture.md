# ADR-0001: Resource-first Studio architecture

## Status

Accepted

## Context

The Studio will manage multiple kinds of digital products, including journals,
planners, workbooks, checklists, templates, and future product types.

These products share collection-level interface concerns, while their cards,
editing behavior, and domain rules may differ.

## Decision

Reusable Studio collection infrastructure will use the term `Resource`.

Resource-level components may organize and render items but must not import or
assume a specific product-domain component. Domain-specific rendering is
provided through composition.

A `Publication`, `Template`, or other product type remains a domain concept and
may use shared resource infrastructure where the reuse is real.

## Consequences

- Collection behavior can be reused across multiple Studio product types.
- Domain-specific cards remain local to their domains.
- Resource components require render callbacks instead of selecting a card
  internally.
- New abstractions should still be introduced only when their responsibility is
  concrete and independently testable.
