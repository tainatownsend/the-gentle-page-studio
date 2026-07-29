# Switch

`Switch` represents an immediate on-or-off setting. It uses a native
checkbox input with `role="switch"` and includes its visible label.

## Basic usage

```tsx
<Switch label="Enable reminders" />
```

## Controlled state

```tsx
<Switch
  label="Enable reminders"
  checked={remindersEnabled}
  onChange={(event) => {
    setRemindersEnabled(event.target.checked)
  }}
/>
```

## Uncontrolled state

```tsx
<Switch
  label="Enable reminders"
  defaultChecked
/>
```

## With Field

Use `Switch` inside `Field` when supporting text or validation feedback
is needed.

```tsx
<Field
  label="Reminder settings"
  description="You can change this later."
 renderLabel={false}>
  <Switch label="Enable reminders" />
</Field>
```

## Validation

```tsx
<Field
  label="Automatic publishing"
  error="You must confirm this setting."
  required
 renderLabel={false}>
  <Switch label="Enable automatic publishing" />
</Field>
```

The switch automatically inherits the generated ID,
`aria-describedby`, `aria-invalid`, and `required` values from `Field`.

## Sizes

```tsx
<Switch label="Small switch" size="sm" />
<Switch label="Medium switch" size="md" />
<Switch label="Large switch" size="lg" />
```

## Label position

The default label position is `end`.

```tsx
<Switch
  label="Enable reminders"
  labelPosition="start"
  fullWidth
/>
```

A leading label is useful for settings rows where the text appears on the
left and the control is aligned to the right.

## Native attributes

Native checkbox attributes remain available.

```tsx
<Switch
  label="Enable reminders"
  name="enable-reminders"
  value="yes"
  disabled
/>
```

## Responsibilities

`Switch` owns:

- the native checkbox input;
- switch semantics through `role="switch"`;
- the visible track and thumb;
- the interactive label;
- checked, disabled, invalid, and required presentation;
- size, width, and label-position variants;
- integration with `Field`;
- ref forwarding.

`Switch` does not own:

- form state;
- validation rules;
- confirmation dialogs;
- asynchronous persistence;
- loading state.

## When to use Switch versus Checkbox

Use `Switch` for a setting that takes effect immediately, such as enabling
reminders or dark mode.

Use `Checkbox` for agreement, acknowledgement, or selecting an item in a
form or list.

## Accessibility

The component uses a native `<input type="checkbox">` with
`role="switch"`. The visible label wraps the input, so activating either
the control or its text toggles the setting.

When used inside `Field`, descriptions and errors are connected through
`aria-describedby`.
