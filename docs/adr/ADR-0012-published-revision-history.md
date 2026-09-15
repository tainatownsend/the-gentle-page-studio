# ADR-0012: Published revision history

## Status

Accepted

## Context

The Studio needs to distinguish ordinary editable draft saves from meaningful release boundaries. Creating a revision on every save would generate noise, while overwriting a previously published state would make it impossible to recover exactly what was released.

## Decision

An explicit transition from Draft to Published creates an immutable `PublicationRevision` snapshot.

A revision stores:

- its own stable ID;
- the source publication ID;
- title and optional description;
- an independent copy of publication content;
- an independent copy of document settings;
- the publication timestamp.

Ordinary Draft saves do not create revisions. Saving an already Published publication as Published again does not create a second revision. Returning to Draft and explicitly publishing again creates the next revision.

Revisions are persisted separately from editable publications under their own versioned local-storage key. This keeps release history independent from the mutable current publication model.

The history page lists published snapshots newest first. Restoring a snapshot creates a new Draft publication with copied content and document settings; it never rewrites or removes historical revisions.

Permanently deleting a publication also removes its associated local revision history.

## Consequences

The Studio preserves a durable record of explicit publication events without creating revision noise during drafting.

Historical content can be recovered safely because restoration is additive rather than destructive.

Revision persistence can evolve independently from publication persistence.

Future compare, diff, named-release, or remote synchronization features can build on the same immutable revision contract.
