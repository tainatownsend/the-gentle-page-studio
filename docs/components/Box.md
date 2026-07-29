# Box

`Box` is the lowest-level layout primitive. It renders a `div` by default and supports semantic elements through the `as` prop.

```tsx
<Box>Content</Box>

<Box as="section" aria-label="Publication settings">
  Content
</Box>
```

`Box` does not add spacing or visual styles. It standardizes polymorphic composition, native element props, class names, inline styles, and refs.
