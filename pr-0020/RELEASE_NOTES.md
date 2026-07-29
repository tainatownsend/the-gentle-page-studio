# PR #0020 release notes

## Added

- `PageHeader` for page title, supporting copy, and page-level actions.
- `Section` for titled content groups with optional descriptions and actions.
- `Toolbar` for accessible groups of page, section, or editor controls.
- Layout-pattern documentation and usage examples.
- Unit tests covering semantics, optional regions, native attributes, refs,
  class names, and heading levels.

## Architecture

The new components live in `src/design-system/layouts`.

They are reusable design-system patterns rather than:

- low-level primitives;
- Studio feature components;
- app-shell components.

The dependency direction remains:

```text
app → studio → design-system → core
```

## Breaking changes

None.

## Next planned work

PR #0021 can compose these patterns with:

- `PublicationCard`
- `TemplateCard`
