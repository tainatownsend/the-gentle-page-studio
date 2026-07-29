# Architecture

This directory records the stable architectural boundaries of The Gentle Page
Studio.

The architecture is intentionally small. It should evolve from real product
requirements rather than speculative abstractions.

## Layers

```text
src/
├── app/
├── core/
├── design-system/
│   ├── primitives/
│   └── shared/
└── studio/
    ├── components/
    ├── features/
    ├── pages/
    └── hooks/
```

### `app`

Application composition and top-level runtime concerns.

Examples:

- application root
- providers
- routing
- global page composition

### `core`

Framework-independent foundations shared across the application.

Examples:

- semantic design tokens
- theme definitions
- stable domain-agnostic utilities

### `design-system/primitives`

Small, reusable building blocks with narrow responsibilities.

Examples:

- Button
- Text
- Field
- Stack
- Surface
- Container

Primitives must not depend on Studio-specific concepts.

### `design-system/shared`

Internal utilities used by the design system.

Shared utilities are introduced only when repeated implementation creates a
real maintenance problem. Small duplication is preferred over premature
abstraction.

### `studio`

Product-specific UI and behavior.

Examples:

- PublicationCard
- TemplateGallery
- PageCanvas
- PropertiesPanel
- export workflows

Studio code may compose design-system primitives. Design-system code must not
import from `studio`.

## Dependency direction

```text
app
├── studio
├── design-system
└── core

studio
├── design-system
└── core

design-system
└── core
```

Dependencies must flow downward. Lower layers must not import from higher
layers.

## Current boundary decision

Reusable compositions such as `Card`, `EmptyState`, `PageHeader`, and `Toolbar`
remain in the design system only when they are domain-neutral and have more than
one concrete use case.

Product-specific compositions belong in `studio`.

A separate `patterns` layer is intentionally deferred until the codebase
demonstrates a sustained need for it.
