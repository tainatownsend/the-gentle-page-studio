# Checkbox

`Checkbox` represents an independent binary choice. It combines a native
checkbox input with its visible label so the entire row is interactive.

## Basic usage

```tsx
<Checkbox label="Publish immediately" />
```

## Controlled state

```tsx
<Checkbox
  label="Publish immediately"
  checked={publishImmediately}
  onChange={(event) => {
    setPublishImmediately(event.target.checked)
  }}
/>
```

## Uncontrolled state

```tsx
<Checkbox
  label="Publish immediately"
  defaultChecked
/>
```

## With Field

Use `Checkbox` inside `Field` when supporting text or validation feedback
is needed.

```tsx
<Field
  label="Publishing preference"
  description="You can change this later."
 renderLabel={false}>
  <Checkbox label="Publish immediately" />
</Field>
```

## Validation error

```tsx
<Field
  label="Publishing consent"
  error="Consent is required."
  required
 renderLabel={false}>
  <Checkbox label="I agree to publish this content" />
</Field>
```

The checkbox automatically inherits the generated ID,
`aria-describedby`, `aria-invalid`, and `required` values from `Field`.

## Sizes

`Checkbox` supports `sm`, `md`, and `lg`.

```tsx
<Checkbox label="Small checkbox" size="sm" />
<Checkbox label="Medium checkbox" size="md" />
<Checkbox label="Large checkbox" size="lg" />
```

## Width

Use `fullWidth` when the interactive label row should fill its container.

```tsx
<Checkbox
  label="Publish immediately"
  fullWidth
/>
```

## Native attributes

Native checkbox attributes remain available.

```tsx
<Checkbox
  label="Include page numbers"
  name="include-page-numbers"
  value="yes"
  disabled
/>
```

## Responsibilities

`Checkbox` owns:

- the native checkbox input;
- the visible interactive label;
- checked, disabled, invalid, and required presentation;
- size and width variants;
- integration with `Field`;
- ref forwarding.

`Checkbox` does not own:

- form state;
- validation rules;
- grouped selection behavior;
- select-all logic;
- indeterminate state.

## Accessibility

The component uses a native `<input type="checkbox">` and wraps it in a
visible `<label>`. This allows users to toggle the checkbox by activating
either the control or its text.

When used inside `Field`, supporting descriptions and errors are connected
through `aria-describedby`. Explicit ARIA attributes remain preserved
where appropriate.
