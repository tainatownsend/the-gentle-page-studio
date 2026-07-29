# Component conventions

## Principles

Components should be:

- small
- composable
- accessible
- predictable
- driven by real product requirements

## React

Use React 19 ref-as-prop.

Use `ComponentPropsWithRef` for native element props.

Do not use `forwardRef` unless a concrete interoperability requirement makes it
necessary.

Polymorphism is allowed only when semantic element choice is useful and the API
remains small.

## TypeScript

- Export public prop types.
- Prefer explicit unions for small variant sets.
- Avoid broad configuration objects.
- Do not use `any`.
- Preserve native element props unless the component intentionally overrides
  them.
- Avoid generic abstractions that hide simple component behavior.

## Props

Good props describe stable responsibilities.

Examples:

```tsx
<Stack gap="md" />
<Surface tone="subtle" />
<Container size="lg" />
```

Avoid speculative props such as:

```text
interactive
selected
compact
clickable
ghost
advanced
```

Add variants only when a real use case requires them.

## Semantic HTML

Use the most appropriate native element first.

Accessibility should come from semantic HTML before ARIA.

ARIA must supplement semantics, not replace them.

## Class names

Use CSS Modules.

Combine module classes and consumer classes with the shared `cn` utility.

Consumer `className` and `style` props should be preserved when appropriate.

## Data attributes

Data attributes may expose stable component state for tests, debugging, or
consumer styling.

Do not use data attributes as a substitute for accessible state.
