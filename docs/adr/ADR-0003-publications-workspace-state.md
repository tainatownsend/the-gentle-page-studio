# ADR-0003: Publications workspace state

## Status

Accepted

## Context

After introducing publication creation, editing, and route-based navigation,
the publications route module was responsible for both navigation and domain
state.

It owned:

- the publication collection;
- creation-mode state;
- draft construction;
- publication lookup;
- publication updates.

Keeping these concerns inside the route layer would make routing increasingly
difficult to maintain as persistence, duplication, deletion, publishing, and
loading states are introduced.

## Decision

Publications workspace state will be encapsulated in
`usePublicationsWorkspace`.

The hook owns the current in-memory publication lifecycle and exposes focused
operations:

- `startCreating`
- `cancelCreating`
- `createDraft`
- `updatePublication`
- `getPublication`

The route layer remains responsible for URL composition and navigation.

Studio pages continue to receive data and callbacks through props and remain
independent from workspace implementation details.

## Consequences

- Route composition becomes smaller and focused on navigation.
- Publication operations have a single feature-level owner.
- Workspace behavior can be tested independently from routing.
- Future persistence can replace the in-memory implementation behind the hook.
- The current workspace is still recreated when the application reloads.
- Structured timestamps, async loading, and error states remain future work.
