# Radio Group

`RadioGroup` represents one exclusive choice from a set of related
options. `Radio` renders each selectable option.

## Basic usage

```tsx
<RadioGroup
  aria-label="Theme"
  defaultValue="light"
>
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
  <Radio value="system" label="System" />
</RadioGroup>
```

## Controlled state

```tsx
<RadioGroup
  aria-label="Theme"
  value={theme}
  onValueChange={setTheme}
>
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
</RadioGroup>
```

## With Field

```tsx
<Field
  label="Theme"
  description="Choose the visual theme."
 renderLabel={false}>
  <RadioGroup aria-label="Theme options">
    <Radio value="light" label="Light" />
    <Radio value="dark" label="Dark" />
  </RadioGroup>
</Field>
```

## Validation

```tsx
<Field
  label="Publication format"
  error="Select a publication format."
  required
 renderLabel={false}>
  <RadioGroup aria-label="Publication formats">
    <Radio value="journal" label="Journal" />
    <Radio value="planner" label="Planner" />
  </RadioGroup>
</Field>
```

## Orientation

The default orientation is vertical.

```tsx
<RadioGroup
  aria-label="Page size"
  orientation="horizontal"
>
  <Radio value="letter" label="US Letter" />
  <Radio value="a4" label="A4" />
</RadioGroup>
```

## Sizes

```tsx
<RadioGroup aria-label="Small options" size="sm">
  <Radio value="one" label="One" />
</RadioGroup>

<RadioGroup aria-label="Large options" size="lg">
  <Radio value="one" label="One" />
</RadioGroup>
```

## Disabled states

Disable the complete group:

```tsx
<RadioGroup aria-label="Theme" disabled>
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
</RadioGroup>
```

Or disable one option:

```tsx
<RadioGroup aria-label="Theme">
  <Radio value="light" label="Light" />
  <Radio value="legacy" label="Legacy" disabled />
</RadioGroup>
```

## Responsibilities

`RadioGroup` owns:

- controlled and uncontrolled selection state;
- the shared native `name`;
- disabled, invalid, required, size, and orientation state;
- integration with `Field`;
- group-level ARIA attributes.

`Radio` owns:

- the native radio input;
- the visible control and option label;
- option-specific disabled state;
- input ref forwarding and native attributes.

## Keyboard behavior

The implementation uses native radio inputs sharing the same `name`.
Browsers therefore provide standard keyboard navigation and exclusive
selection behavior without replacing native semantics with custom
JavaScript.

## Accessibility

Provide an accessible name to the group with `aria-label` or
`aria-labelledby`. Each `Radio` uses a native `<input type="radio">`
inside a visible label.

When nested in `Field`, descriptions and validation errors are connected
to the group through `aria-describedby`.
