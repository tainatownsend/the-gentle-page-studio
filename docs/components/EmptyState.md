# EmptyState

`EmptyState` explains why a region has no content and provides an appropriate
next action.

## Usage

```tsx
<EmptyState
  title="No publications yet"
  description="Create your first publication to begin."
  actions={
    <Button>Create publication</Button>
  }
/>
```

## Icon

Icons are optional and decorative.

```tsx
<EmptyState
  icon={<PublicationIcon />}
  title="No publications yet"
/>
```

The icon wrapper is hidden from assistive technology. Important meaning must be
present in the title or description.

## Alignment

```tsx
<EmptyState align="center" ... />
<EmptyState align="start" ... />
```

Centered alignment is the default.

## Accessibility

- Use a clear, specific title.
- Explain the empty condition without blaming the user.
- Provide an action only when there is a meaningful next step.
- Do not rely on the icon to communicate essential information.
