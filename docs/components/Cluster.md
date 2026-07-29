# Cluster

`Cluster` arranges related items horizontally and allows them to wrap when
the available width is insufficient.

## Usage

```tsx
<Cluster gap="sm">
  <Badge>New</Badge>
  <Badge>Featured</Badge>
  <Badge>Planner</Badge>
</Cluster>
```

## Alignment

```tsx
<Cluster
  gap="lg"
  align="baseline"
  justify="between"
>
  ...
</Cluster>
```

`Cluster` supports the same `gap`, `align`, and `justify` vocabulary as
`Inline`. Unlike `Inline`, wrapping is always enabled.

## Semantic element

```tsx
<Cluster
  as="nav"
  aria-label="Publication filters"
>
  ...
</Cluster>
```

Use `Cluster` for groups of tags, filters, badges, compact actions, and other
horizontal content that may need to wrap.
