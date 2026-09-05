# Contributing

## Before committing

Run the unified quality gate:

```bash
npm run quality
```

This runs lint, the full test suite, and the production build.

## Repair workflow

When an implementation script or format-sensitive patch fails because the repository differs from the expected snapshot:

1. Stop rerunning the same patch.
2. Capture the exact current contents of every affected file.
3. Build the repair from that snapshot.
4. Prefer deterministic rewrites or stable structural boundaries over repeated formatting-sensitive substitutions.
5. Run targeted tests for the affected area, then run `npm run quality`.

For tests, prefer deterministic input events when character-by-character typing behavior is not the behavior under test. Use browser-like interaction helpers when interaction sequencing itself matters.

## Commit style

Use Conventional Commits:

```text
chore: initialize project structure
feat(core): add design tokens
fix(home): preserve publication ordering
```

## Pull request expectations

- Keep the change focused.
- Include tests for behaviour.
- Preserve accessibility and keyboard support.
- Document architectural decisions that affect future work.
- Validate responsive and theme behavior for visual changes before merging.
