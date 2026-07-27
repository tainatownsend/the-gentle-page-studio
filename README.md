# The Gentle Page Studio

A publishing workspace for thoughtful creators.

## Current milestone

**Commit 1 — Core Foundation**

This milestone establishes the project structure, development tooling, testing setup, quality checks, and initial application entry point.

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Vitest + Testing Library
- ESLint + Prettier
- Husky + lint-staged

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Quality commands

```bash
npm run lint
npm run test
npm run build
npm run format
```

## Project structure

```text
src/
├── app/             Application entry, routing, and providers
├── core/            Infrastructure, tokens, theme, config, hooks, utilities
├── design-system/   Domain-agnostic components and layouts
├── studio/          Product-domain features
├── shared/          Shared types, constants, and utilities
└── assets/          Static application assets
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for placement rules and design decisions.
