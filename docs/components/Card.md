# Card

`Card` presents a contained editorial unit.

It composes `Surface` and adds consistent radius and internal padding.

## Usage

```tsx
<Card>
  <Stack gap="md">
    <Text as="h2" variant="heading">
      ADHD Emotional Regulation
    </Text>

    <Text>
      A guided journal for noticing emotions and choosing supportive responses.
    </Text>
  </Stack>
</Card>
```

## Padding

```tsx
<Card padding="sm">...</Card>
<Card padding="md">...</Card>
<Card padding="lg">...</Card>
```

The default padding is `md`.

## Tone

`Card` supports the same tones as `Surface`.

```tsx
<Card tone="subtle">...</Card>
<Card tone="elevated">...</Card>
```

## Semantic element

```tsx
<Card
  as="article"
  aria-label="ADHD Emotional Regulation"
>
  ...
</Card>
```

`Card` does not provide header, body, or footer subcomponents. Compose its
content with layout and typography primitives.
