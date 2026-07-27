# Architecture

## Purpose

The project uses a domain-oriented structure that separates application infrastructure, reusable interface components, and Studio-specific product features.

## Placement rules

### `app/`

Application composition only: root component, routes, providers, and global styles. Business logic does not belong here.

### `core/`

Infrastructure shared across the product: theme, design tokens, configuration, generic hooks, and framework-independent utilities.

### `design-system/`

Reusable, domain-agnostic UI. A component belongs here only when it can be understood without knowing what a Publication, Collection, or Workspace is.

### `studio/`

Product-domain features. Components such as `PublicationCard` or `CollectionList` belong here and may compose design-system primitives.

### `shared/`

Cross-domain types, constants, and utilities that do not fit application infrastructure or the design system.

## Dependency direction

```text
app → studio → design-system → core
       ↓             ↓
     shared ←────────┘
```

Lower layers must not import product-domain modules from higher layers.

## Evolution rule

Create abstractions only after a real reuse case appears. Keep features local until their reusable responsibility is proven.
