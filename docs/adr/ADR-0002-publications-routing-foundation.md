# ADR-0002: Publications routing foundation

## Status

Accepted

## Context

The Studio now has two distinct publication screens:

- the publications library;
- the publication editor.

Conditional rendering in the application root was sufficient while validating
the first creation and editing flows, but it does not provide stable URLs,
browser history, deep-linkable screens, or a scalable foundation for future
editor areas.

`react-router-dom` is already an application dependency.

## Decision

The application will use React Router for screen-level navigation.

Initial routes:

- `/publications`
- `/publications/:publicationId/edit`

The root path and unknown paths redirect to `/publications`.

Routing remains in the `app` layer. Studio pages do not import router APIs;
they continue to receive navigation callbacks as props.

The current publication collection remains in memory. A direct editor URL for
a publication that is not present in memory redirects safely to the library.

## Consequences

- Library and editor screens have distinct URLs.
- Browser history can represent navigation between screens.
- App-level route composition becomes explicit.
- Studio components remain independent from the routing library.
- Refreshing an editor URL cannot restore in-memory data until persistence is
  introduced.
- Workspace state extraction and persistence can be added without changing the
  page component contracts.
