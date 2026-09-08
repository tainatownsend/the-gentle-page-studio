# ADR-0013: Interactive publication blocks

## Status

Accepted

## Context

The Studio needs a small fillable-publication foundation after static print/PDF output. Interactive fields must be authored explicitly rather than inferred during export so editor, preview, revision history, and future PDF serialization share one durable semantic model.

## Decision

The first interactive content types are:

- `multiline-text-field`
- `checkbox-field`

Both remain ordinary ordered publication blocks and carry a durable block ID plus author-facing `text` used as the prompt or label.

Filled user responses are not stored in the publication authoring model. Publications describe the form; response data belongs to a future runtime/fill layer.

Publication workspace persistence advances to version 4. Version 3 publications migrate without changing their existing heading and paragraph content.

Revision persistence advances to version 2 so published snapshots can safely contain interactive blocks while legacy version 1 revision history remains readable.

## Consequences

Interactive fields participate naturally in block ordering, duplication, publication revisions, layout projection, and future export.

The model stays independent from any PDF library or browser form implementation.

Editor controls, publication-preview affordances, and binary fillable-PDF serialization can evolve separately without another content-model redesign.
