# Layout primitives

The Gentle Page Studio uses small, focused layout primitives instead of component-specific spacing CSS.

- `Box`: polymorphic composition only.
- `Stack`: vertical flow with token-based gaps.
- `Inline`: horizontal, non-wrapping flow with token-based gaps.

Rules:

1. Public spacing APIs use the existing semantic spacing tokens.
2. Each primitive has one clear responsibility.
3. Every primitive includes tests, documentation, and a public export.
4. Wrapping is excluded from `Inline`; it belongs to `Cluster`.

## Polymorphic composition

`Box`, `Stack`, and `Inline` share the same React 19 polymorphic pattern:
the rendered element is selected with `as`, and its native props and `ref`
are accepted through `ComponentPropsWithRef`.

React 19 supports `ref` as a regular component prop, so these primitives do
not require `forwardRef`. This avoids unsafe generic casts while preserving
element-specific prop and ref inference.
