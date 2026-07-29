# ADR 0002: React 19 ref handling

- Status: Accepted

## Context

React 19 supports `ref` as a regular prop for function components.

Using `forwardRef` for every primitive adds ceremony and can complicate generic
polymorphic component types.

## Decision

Use React 19 ref-as-prop through `ComponentPropsWithRef`.

Do not use `forwardRef` by default.

## Consequences

- Component implementations remain smaller.
- Native ref types remain available through component props.
- Interoperability cases that specifically require `forwardRef` must document
  the exception.
