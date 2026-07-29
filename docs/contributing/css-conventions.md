# CSS conventions

## Tokens

Components must use semantic CSS variables.

Examples:

```css
color: var(--color-text-primary);
background: var(--color-surface-primary);
border-color: var(--color-border-primary);
gap: var(--space-md);
border-radius: var(--radius-md);
box-shadow: var(--shadow-md);
```

Raw colors are not allowed inside components.

Fallback values are permitted only when the existing codebase requires them for
safe incremental adoption.

## Ownership

A component stylesheet should own only the component's visual responsibility.

Examples:

- `Stack` owns vertical layout and gap.
- `Surface` owns background, border, and elevation.
- `Container` owns maximum width, centering, and page gutters.

Do not duplicate another primitive's responsibility.

## Layout

Prefer logical properties:

```css
margin-inline
padding-inline
inset-inline
```

Use flexbox and grid deliberately. Avoid absolute positioning for ordinary
layout.

## Selectors

Keep selectors shallow.

Prefer one class per visual responsibility.

Avoid styling descendants by element name when a local class is clearer and
more stable.

## Responsive behavior

Responsive rules should follow product requirements.

Do not add breakpoints or alternate layouts without a concrete use case.
