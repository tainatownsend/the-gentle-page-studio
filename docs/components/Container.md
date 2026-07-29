# Container

`Container` centers page content and constrains its maximum width.

## Usage

```tsx
<Container>
  Page content
</Container>
```

The default size is `lg`.

## Sizes

```tsx
<Container size="sm">...</Container>
<Container size="md">...</Container>
<Container size="lg">...</Container>
<Container size="full">...</Container>
```

- `sm`: focused reading and narrow forms
- `md`: standard content pages
- `lg`: application workspaces
- `full`: full-width content with responsive inline padding

## Semantic element

```tsx
<Container as="main">
  ...
</Container>
```

`Container` controls page width and responsive inline gutters only. Use layout
primitives inside it to arrange content.
