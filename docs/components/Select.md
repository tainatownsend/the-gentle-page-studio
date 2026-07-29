# Select

`Select` provides a styled native HTML select control while preserving
browser behavior, keyboard interaction, and accessibility semantics.

## Basic usage

```tsx
<Select aria-label="Publication type">
  <option value="">Choose a type</option>
  <option value="journal">Journal</option>
  <option value="planner">Planner</option>
  <option value="workbook">Workbook</option>
</Select>
```

## With Field

Use `Select` inside `Field` when a visible label, description, required
state, or validation message is needed.

```tsx
<Field
  label="Publication type"
  description="Choose the format that best matches your project."
  required
>
  <Select>
    <option value="">Choose a type</option>
    <option value="journal">Journal</option>
    <option value="planner">Planner</option>
  </Select>
</Field>
```

## Validation error

```tsx
<Field
  label="Publication type"
  error="A publication type is required."
>
  <Select>
    <option value="">Choose a type</option>
  </Select>
</Field>
```

The nested control automatically receives the generated ID,
`aria-describedby`, `aria-invalid`, and `required` values from `Field`.

## Sizes

`Select` supports `sm`, `md`, and `lg`.

```tsx
<Select size="sm">...</Select>
<Select size="md">...</Select>
<Select size="lg">...</Select>
```

## Width

Use `fullWidth` when the control should fill its container.

```tsx
<Select fullWidth>...</Select>
```

## Native attributes

All native select attributes are supported.

```tsx
<Select
  name="publication-type"
  defaultValue="journal"
>
  <option value="journal">Journal</option>
  <option value="planner">Planner</option>
</Select>
```

A native multi-select is also supported.

```tsx
<Select
  aria-label="Export formats"
  multiple
>
  <option value="pdf">PDF</option>
  <option value="epub">EPUB</option>
</Select>
```

## Responsibilities

`Select` owns:

- visual select styling;
- size and width variants;
- disabled and invalid presentation;
- native select behavior;
- integration with `Field`;
- ref forwarding.

`Select` does not own:

- form state;
- validation rules;
- searchable options;
- asynchronous option loading;
- custom multi-select interactions;
- option virtualization.

## Accessibility

The component uses the native `<select>` element to retain browser and
assistive-technology behavior.

When used without `Field`, provide an accessible name through a native
`label`, `aria-label`, or `aria-labelledby`.

When used inside `Field`, accessible relationships are applied
automatically while explicit control attributes are preserved where
appropriate.
