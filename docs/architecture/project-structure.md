# Project structure

## Current structure

```text
src/
├── app/
├── core/
│   ├── theme/
│   └── tokens/
├── design-system/
│   ├── primitives/
│   └── shared/
└── studio/
```

The `studio` directory is created when the first product-specific component is
introduced. Empty architectural directories are not added in advance.

## Component location rule

Ask:

> Could this component be used outside The Gentle Page Studio without knowing
> what a publication, template, page, or export is?

- If yes, it may belong in `design-system`.
- If no, it belongs in `studio`.

## Feature location rule

Product behavior should be grouped by feature when it has meaningful state,
business rules, or workflows.

Example:

```text
src/studio/features/publications/
├── components/
├── hooks/
├── model/
└── index.ts
```

Do not create feature folders for a single trivial component.

## Public exports

Each component directory owns a local `index.ts`.

Layer-level exports expose the supported public API.

Internal implementation files must not be imported through deep paths from
outside their owning layer.

## Tests and documentation

Component tests remain next to the component.

```text
Component/
├── Component.tsx
├── Component.module.css
├── Component.test.tsx
└── index.ts
```

Design-system component documentation lives in:

```text
docs/components/
```

Architecture documentation lives in:

```text
docs/architecture/
```
