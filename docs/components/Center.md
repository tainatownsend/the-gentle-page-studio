# Center

`Center` centers its children on both axes.

## Usage

```tsx
<Center>
  <Spinner />
</Center>
```

## Semantic element

```tsx
<Center
  as="section"
  aria-label="Loading publication"
>
  <Spinner />
</Center>
```

`Center` intentionally has no alignment or direction props. Use `Inline`,
`Stack`, or `Cluster` when a more configurable layout is required.

The parent or consumer remains responsible for providing the available width
and height in which the content should be centered.
