# ADR 0004: Abstraction threshold

- Status: Accepted

## Context

Early design-system development creates opportunities to generalize repeated
code before its stable shape is known.

Premature abstraction can increase API surface, hide simple behavior, and make
future product changes harder.

## Decision

Prefer small duplication over speculative abstraction.

Create shared utilities, compound component APIs, and additional architectural
layers only after concrete repeated use demonstrates a stable responsibility.

## Consequences

- Some implementation details may repeat temporarily.
- APIs remain smaller.
- Refactoring occurs with evidence from real Studio use cases.
- A separate design-system `patterns` layer is deferred.
