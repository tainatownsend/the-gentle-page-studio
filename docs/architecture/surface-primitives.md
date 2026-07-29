# Surface primitives

Surface primitives establish visual regions and page-width boundaries without
owning domain-specific content.

```text
Surface layer
├── Surface
├── Divider
└── Container
```

## Surface

`Surface` owns semantic background, border, and elevation. It does not own
padding or internal layout.

## Divider

`Divider` provides horizontal or vertical visual separation using the existing
semantic border color.

## Container

`Container` centers page content, applies responsive inline gutters, and
provides a small set of deliberate maximum-width options.

## Rules

1. Components use semantic CSS variables rather than raw colors.
2. `Surface` remains visually focused and does not become a layout primitive.
3. `Container` controls width, not internal composition.
4. `Divider` is visual structure, not a substitute for document semantics.
5. New variants are added only when real Studio use cases require them.

## Why Card is deferred

`Card` is intentionally deferred until concrete Studio content patterns reveal
its required padding, radius, composition, and interaction model. This avoids
creating a wrapper around `Surface` before the component has a distinct
responsibility.
