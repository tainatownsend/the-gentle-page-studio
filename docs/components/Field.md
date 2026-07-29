\# Field



`Field` provides the accessible structure surrounding a form control.



It connects labels, descriptions, validation messages, and required

states to compatible Design System controls.



\## Basic usage



```tsx

<Field

&#x20; label="Publication title"

&#x20; description="Choose a clear and descriptive title."

>

&#x20; <Input />

</Field>

```



\## Required field



```tsx

<Field

&#x20; label="Author name"

&#x20; required

>

&#x20; <Input />

</Field>

```



The required state is propagated to the nested control.



\## Validation error



```tsx

<Field

&#x20; label="Publication title"

&#x20; error="A publication title is required."

>

&#x20; <Input />

</Field>

```



When an error exists:



\- the control receives `aria-invalid="true"`;

\- the error is included in `aria-describedby`;

\- the error message uses `role="alert"`.



\## Description and error



```tsx

<Field

&#x20; label="Publication title"

&#x20; description="Maximum 120 characters."

&#x20; error="A publication title is required."

>

&#x20; <Input />

</Field>

```



Both messages are connected to the control.



\## Explicit control ID



```tsx

<Field

&#x20; label="Author name"

&#x20; controlId="author-name"

>

&#x20; <Input />

</Field>

```



An ID is generated automatically when `controlId` is omitted.



\## Optional fields



Non-required fields display `Optional` by default.



```tsx

<Field label="Subtitle">

&#x20; <Input />

</Field>

```



The optional text can be customized or hidden with `optionalText`.



\## Responsibilities



`Field` owns:



\- label association;

\- field description;

\- validation message;

\- required state;

\- accessible relationships between these elements.



`Field` does not own:



\- form state;

\- schema validation;

\- submission behavior;

\- product-specific business rules.



\## Accessibility



Compatible controls consume the Field context and receive:



\- `id`;

\- `required`;

\- `aria-invalid`;

\- `aria-describedby`.



Explicit attributes supplied directly to a control are preserved where

appropriate.

## Internal control labels

Use `renderLabel={false}` when the child control already renders its own
accessible label, such as `Checkbox`, `Switch`, or individual radio options.

```tsx
<Field
  label="Reminder settings"
  renderLabel={false}
  description="Choose whether reminders are enabled."
>
  <Switch label="Enable reminders" />
</Field>
```

The `Field` continues to provide the control ID, description, error, required,
and invalid state through context. It only stops rendering the external
`<label>`.
