# Layout primitives

The Gentle Page Studio uses small, focused layout primitives instead of
component-specific spacing CSS.

```text
Layout
├── Box
├── Stack
├── Inline
├── Cluster
├── Center
└── Spacer
```

- `Box`: polymorphic composition only.
- `Stack`: vertical flow with token-based gaps.
- `Inline`: horizontal, non-wrapping flow with token-based gaps.
- `Cluster`: horizontal flow with token-based gaps and wrapping.
- `Center`: centers content on both axes.
- `Spacer`: pushes following content toward the inline end of a flex layout.

## Rules

1. Public spacing APIs use the existing semantic spacing tokens.
2. Each primitive has one clear responsibility.
3. Every primitive includes tests, documentation, and a public export.
4. Wrapping is excluded from `Inline`; it belongs to `Cluster`.
5. Layout primitives remain explicit rather than sharing speculative internal
   abstractions.

## Polymorphic composition

`Box`, `Stack`, `Inline`, `Cluster`, and `Center` use the same React 19
polymorphic pattern: the rendered element is selected with `as`, and its
native props and `ref` are accepted through `ComponentPropsWithRef`.

React 19 supports `ref` as a regular component prop, so these primitives do
not require `forwardRef`. This avoids unsafe generic casts while preserving
element-specific prop and ref inference.

`Spacer` intentionally renders a `div`. It is a structural flex item rather
than a semantic content container and is hidden from the accessibility tree.
