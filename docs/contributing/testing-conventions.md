# Testing conventions

## Scope

Component tests should verify public behavior rather than implementation
details.

Test:

- accessible rendering
- semantic elements
- documented variants
- native prop forwarding
- className and style forwarding when supported
- ref forwarding
- user interaction
- controlled and uncontrolled behavior when applicable

## Queries

Prefer Testing Library queries in this order:

1. role
2. label
3. text
4. test id

Use `data-testid` only when the element has no useful accessible query.

## CSS Modules

Class assertions are acceptable for documented visual variants and layout
states.

Do not test every individual CSS declaration in unit tests.

## Accessibility

Interactive components must be tested using their accessible names and native
roles.

Keyboard interaction must be tested when the component introduces custom
keyboard behavior.

## Validation

Every pull request must pass:

```bash
npm run lint
npm run test
npm run build
```
