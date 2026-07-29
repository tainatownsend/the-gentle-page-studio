# Component quality checklist

Use this checklist before opening a component pull request.

## Purpose

- [ ] The component solves a concrete product or design-system need.
- [ ] Its responsibility can be explained in one sentence.
- [ ] It does not duplicate an existing primitive.
- [ ] It belongs in the correct architectural layer.

## API

- [ ] The API is small.
- [ ] Props describe stable responsibilities.
- [ ] Variants are supported by real use cases.
- [ ] Native props are preserved where appropriate.
- [ ] Public types are exported.
- [ ] Ref behavior follows the React 19 convention.

## Accessibility

- [ ] Semantic HTML is used first.
- [ ] The component has an appropriate accessible name.
- [ ] Required states are exposed accessibly.
- [ ] Keyboard behavior is covered when relevant.
- [ ] ARIA is used only when necessary.

## Styling

- [ ] CSS Modules are used.
- [ ] Raw colors are absent.
- [ ] Semantic tokens are used.
- [ ] Layout responsibility is not duplicated.
- [ ] Consumer `className` and `style` work when supported.

## Testing

- [ ] Public behavior is tested.
- [ ] Accessible queries are preferred.
- [ ] Variants are tested.
- [ ] Native prop forwarding is tested when relevant.
- [ ] Ref forwarding is tested when relevant.

## Documentation

- [ ] Usage is documented.
- [ ] Variants are documented.
- [ ] Accessibility behavior is documented when relevant.
- [ ] Architectural decisions are recorded when the change affects project
      boundaries.

## Validation

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
