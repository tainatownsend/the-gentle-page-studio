# Surface

`Surface` provides semantic background, border, and elevation styles without
controlling internal spacing or layout.

## Usage

```tsx
<Surface>
  Content
</Surface>
```

## Tones

```tsx
<Surface tone="default">...</Surface>
<Surface tone="subtle">...</Surface>
<Surface tone="elevated">...</Surface>
```

## Semantic element

```tsx
<Surface
  as="section"
  aria-label="Publication details"
>
  ...
</Surface>
```

Use layout primitives such as `Stack`, `Inline`, and `Box` inside `Surface`.
Padding intentionally remains the responsibility of the consumer.
