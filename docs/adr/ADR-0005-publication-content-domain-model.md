# ADR-0005: Publication content domain model

## Status

Accepted

## Context

A publication currently stores only library metadata. The Studio
needs a durable content representation before a content editor,
preview, or export flow can be introduced.

The first representation must be small, serializable, testable, and
independent from any rich-text editor library.

## Decision

A publication owns a required `content` object containing an ordered
array of blocks.

The initial block union supports:

- headings with levels 1, 2, or 3;
- paragraphs;
- a durable string ID on every block.

New publications start with an empty block collection.

Duplicated publications receive an independent copy of the content
and block objects.

The persisted workspace advances from version 1 to version 2. Version
1 publications are migrated by adding empty content. Version 2 is
stored under a new storage key while the version 1 key remains
readable for migration.

## Consequences

The domain can now evolve toward block editing and preview without
depending on a third-party editor format.

Existing local publications remain available, but they begin with
empty content because version 1 did not contain document data.

Future incompatible content changes require another explicit schema
version and migration.
