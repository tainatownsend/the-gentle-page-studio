# ADR-001: Use domain-oriented project structure

- Status: Accepted
- Date: 2026-07-27

## Context

The Studio is expected to evolve beyond a single journal feature. A purely technical or atomic component structure would make domain ownership less clear as the product grows.

## Decision

Separate application composition, infrastructure, reusable design-system code, and Studio product domains.

## Consequences

Feature code remains discoverable, reusable primitives stay domain-agnostic, and dependencies can be reviewed through a clear direction.
