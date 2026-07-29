# Spacer

`Spacer` consumes the remaining inline space before the content that follows
it.

## Usage

```tsx
<Inline>
  <Text>Publication</Text>
  <Spacer />
  <Button>Save</Button>
</Inline>
```

`Spacer` uses logical inline spacing, so its behavior follows the document's
writing direction.

It is a decorative layout element and is hidden from the accessibility tree.
Use it only inside flex-based horizontal compositions such as `Inline`.
