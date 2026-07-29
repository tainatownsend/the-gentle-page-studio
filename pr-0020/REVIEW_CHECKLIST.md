# PR #0020 review checklist

## Structure

- [ ] `PageHeader` is under `src/design-system/layouts/PageHeader`.
- [ ] `Section` is under `src/design-system/layouts/Section`.
- [ ] `Toolbar` is under `src/design-system/layouts/Toolbar`.
- [ ] All three components are exported by `src/design-system/layouts/index.ts`.
- [ ] No component imports from `studio` or `app`.

## React and TypeScript

- [ ] Refs use React 19 ref handling.
- [ ] `forwardRef` is not used.
- [ ] Native HTML attributes are supported.
- [ ] Public prop types are exported.
- [ ] Caller-provided `className` is preserved.

## Accessibility

- [ ] `PageHeader` renders one `h1`.
- [ ] `Section` supports heading levels 2–4.
- [ ] Toolbar examples provide `aria-label` or `aria-labelledby`.
- [ ] Interactive controls retain visible labels.
- [ ] Layout remains understandable without optional content.

## Styling

- [ ] No raw colors were introduced.
- [ ] CSS uses logical properties where appropriate.
- [ ] Narrow-screen behavior was reviewed.
- [ ] Actions wrap instead of overflowing.

## Validation

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `git diff` contains only PR #0020 changes.
