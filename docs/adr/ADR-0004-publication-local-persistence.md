# ADR-0004: Publication local persistence

## Status

Accepted

## Context

Publication creation, editing, routing, and workspace state are functional, but
all publication data is lost when the application reloads. This also prevents a
direct editor URL from surviving refresh.

The Studio needs a small persistence foundation before introducing a remote
backend.

## Decision

The publications workspace will persist durable domain data in `localStorage`.

Stored data uses a versioned envelope:

```json
{
  "version": 1,
  "publications": []
}
```

The storage key is:

```text
the-gentle-page:publications-workspace:v1
```

Publication dates are stored as ISO timestamps through `createdAt` and
`updatedAt`. New publications use durable random identifiers.

Storage access is isolated in the publications persistence module. Persisted
data is validated before entering application state. Invalid, unknown, or
unreadable payloads safely fall back to an empty collection.

Only durable publication data is stored. Creation mode, routes, callbacks, and
unfinished form values are not persisted.

## Consequences

- Publications survive browser refresh and later sessions.
- Existing publication editor URLs can resolve after refresh.
- Domain data no longer stores presentation strings such as `Just now`.
- Storage schema evolution can be handled through explicit versions.
- Local storage failures do not break the application.
- Data remains local to one browser and device.
- There is no synchronization, authentication, or conflict handling.
- A future backend or IndexedDB implementation can replace the persistence
  module without changing page contracts.
