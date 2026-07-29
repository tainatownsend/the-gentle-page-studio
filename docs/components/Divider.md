# Divider

`Divider` separates adjacent regions visually.

## Horizontal

```tsx
<Divider />
```

Horizontal is the default orientation.

## Vertical

```tsx
<Inline>
  <Button>Preview</Button>
  <Divider orientation="vertical" />
  <Button>Export</Button>
</Inline>
```

The component always uses `role="separator"`. Vertical dividers also expose
`aria-orientation="vertical"`.

A divider communicates visual structure only. It should not replace headings,
landmarks, or other semantic organization.
