# ResourceCollection

## Purpose

`ResourceCollection` renders a responsive collection of Studio resources
without knowing how an individual resource is displayed.

The caller supplies the resource key and rendering function, allowing the
collection to support publications, templates, planners, and future resource
types without importing their domain-specific components.

## API

- `resources`: items to render.
- `getResourceKey`: returns a stable React key for each item.
- `renderResource`: renders an individual item.
- `emptyTitle`: heading displayed when the collection is empty.
- `emptyDescription`: optional supporting empty-state copy.
- `emptyIcon`: optional decorative empty-state icon.
- `emptyActions`: optional empty-state actions.

Native `section` attributes are also supported.

## Example

```tsx
<ResourceCollection
  aria-label="Publications"
  resources={publications}
  getResourceKey={(publication) => publication.id}
  renderResource={(publication) => (
    <PublicationCard publication={publication} />
  )}
  emptyTitle="No publications yet"
/>
```

## Accessibility

When resources exist, the component renders a semantic list inside a section.
Callers should provide an accessible name such as `aria-label` when the
surrounding page does not already establish the collection context.

The empty state uses the design system's `EmptyState` primitive.

## Design notes

The component owns collection orchestration and layout only. It does not know
about resource types, actions, filters, sorting, pagination, or data loading.
