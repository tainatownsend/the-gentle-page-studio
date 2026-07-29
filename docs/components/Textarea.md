# Textarea

`Textarea` captures longer, multi-line text while following the same
accessibility contract as other form controls in the Design System.

## Basic usage

```tsx
<Textarea
  aria-label="Publication summary"
  placeholder="Describe the publication..."
/>
```

## With Field

Use `Textarea` inside `Field` when a visible label, description, required
state, or validation message is needed.

```tsx
<Field
  label="Publication summary"
  description="Explain the purpose and intended audience."
  required
>
  <Textarea />
</Field>
```

## Validation error

```tsx
<Field
  label="Publication summary"
  error="A publication summary is required."
>
  <Textarea />
</Field>
```

The nested control automatically receives the generated ID,
`aria-describedby`, `aria-invalid`, and `required` values from `Field`.

## Sizes

`Textarea` supports `sm`, `md`, and `lg`.

```tsx
<Textarea size="sm" />
<Textarea size="md" />
<Textarea size="lg" />
```

## Width

Use `fullWidth` when the control should fill its container.

```tsx
<Textarea fullWidth />
```

## Resize behavior

Vertical resizing is enabled by default.

```tsx
<Textarea resize="vertical" />
<Textarea resize="horizontal" />
<Textarea resize="both" />
<Textarea resize="none" />
```

Disable resizing only when the surrounding layout provides enough space
for the entered content.

## Native attributes

All native textarea attributes are supported.

```tsx
<Textarea
  name="publication-summary"
  rows={6}
  maxLength={500}
/>
```

## Responsibilities

`Textarea` owns:

- visual textarea styling;
- size and width variants;
- resize behavior;
- disabled and invalid presentation;
- integration with `Field`;
- ref forwarding.

`Textarea` does not own:

- form state;
- validation rules;
- character counters;
- auto-resize behavior;
- rich-text editing.

## Accessibility

When used without `Field`, provide an accessible name through a native
`label`, `aria-label`, or `aria-labelledby`.

When used inside `Field`, accessible relationships are applied
automatically while explicit control attributes are preserved where
appropriate.
