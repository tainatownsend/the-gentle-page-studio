# PR #0020 — Studio Layout Patterns

Adds three reusable layout patterns to `src/design-system/layouts`:

- `PageHeader`
- `Section`
- `Toolbar`

## Why this location?

The repository already separates primitives from higher-level layout patterns:

```text
src/design-system/
  primitives/
  layouts/
```

These components are reusable across the Studio, but they are not low-level primitives.  
They therefore belong in `src/design-system/layouts`.

## Branch

```bash
git checkout -b feature/studio-layout-patterns
```

If the branch already exists:

```bash
git checkout feature/studio-layout-patterns
```

## Execution order

Run each script from the repository root:

```bash
bash pr-0020/01-components.sh
bash pr-0020/02-tests.sh
bash pr-0020/03-docs.sh
```

Then validate:

```bash
npm run lint
npm run test
npm run build
```

## Review the changes

```bash
git status
git diff --stat
git diff
```

## Commit

```bash
git add .
git commit -m "feat(layouts): add studio layout patterns"
git push -u origin feature/studio-layout-patterns
```

## Public APIs

### PageHeader

```tsx
<PageHeader
  eyebrow="Workspace"
  title="Publications"
  description="Create, organize, and continue your work."
  actions={<Button>Create publication</Button>}
/>
```

### Section

```tsx
<Section
  title="Recent publications"
  description="Continue editing your latest work."
  actions={<Button variant="secondary">View all</Button>}
>
  ...
</Section>
```

### Toolbar

```tsx
<Toolbar
  aria-label="Publication tools"
  start={<SearchField />}
  end={<Button>New publication</Button>}
/>
```

## Acceptance criteria

- Components use React 19 ref handling without `forwardRef`.
- Components accept native HTML attributes.
- Components preserve caller-provided `className`.
- Layout remains usable when optional content is absent.
- Toolbar has an accessible name in examples and product usage.
- No raw color values are introduced.
- Tests, lint, and build pass.
