# Publication domain model

## Purpose

This module contains the shared domain types used by the publications feature.

Domain models live independently from visual components so pages, forms,
application state, services, and future persistence layers can depend on the
publication contract without depending on `PublicationCard`.

## Current model

### Publication

- `id`: stable publication identifier.
- `title`: working or published title.
- `description`: optional summary.
- `updatedAt`: optional display-ready update label used by the current
  in-memory prototype.
- `status`: current publication lifecycle status.

### PublicationStatus

Current supported values:

- `draft`
- `published`

## Evolution

The current `updatedAt` field remains compatible with the existing prototype.
When persistence is introduced, temporal values should evolve to structured
timestamps rather than presentation strings.
