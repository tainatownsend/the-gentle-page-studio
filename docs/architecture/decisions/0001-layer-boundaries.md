# ADR 0001: Layer boundaries

- Status: Accepted

## Context

The project contains application composition, reusable design-system
components, foundations, and product-specific Studio behavior.

Without explicit boundaries, domain concepts can leak into generic components
and create circular or upward dependencies.

## Decision

Use the following dependency direction:

```text
app → studio → design-system → core
```

The `app` layer may compose all lower layers.

The `studio` layer may depend on the design system and core.

The design system may depend on core.

Lower layers must not import from higher layers.

## Consequences

- Product concepts remain outside generic primitives.
- Design-system components remain reusable.
- Dependency review becomes straightforward.
- Some small duplication may exist across layers until a stable shared
  abstraction emerges.
