# Publication domain model

## Purpose

This module contains the shared domain types used by the publications feature.

Domain models live independently from visual components so pages, forms,
application state, persistence, preview, and export layers can depend on the
publication contract without depending on visual components.

## Current model

### Publication

- `id`: stable publication identifier.
- `title`: working or published title.
- `description`: optional summary.
- `status`: current lifecycle status.
- `content`: ordered publication content blocks.
- `documentSettings`: durable physical document settings used by editorial and export flows.
- `createdAt`: creation timestamp.
- `updatedAt`: last-updated timestamp.

### PublicationStatus

Current supported values:

- `draft`
- `published`

### PublicationDocumentSettings

The MVP uses fixed Gentle Page defaults:

- US Letter page size;
- portrait orientation;
- 0.75 inch margins on every side.

These settings are stored in the domain model even though the MVP does not expose configuration controls. This keeps future print preview and export behavior explicit and deterministic.

## Evolution

The domain should remain serializable and independent from editor or PDF libraries.

Future changes to persisted publication structure require an explicit storage schema version and migration so existing local work remains readable.
