# ADR-0007: Publication document settings

## Status

Accepted

## Context

The Studio is moving from free-flowing publication content toward printable editorial documents. A durable document settings contract is required before page layout, print preview, and PDF export can depend on physical page geometry.

The MVP product decisions already establish US Letter, portrait orientation, and Gentle Page-owned defaults rather than per-publication configuration UI.

## Decision

Every publication owns required `documentSettings` containing:

- `pageSize`, initially limited to `us-letter`;
- `orientation`, initially limited to `portrait`;
- margins expressed in inches for top, right, bottom, and left.

The Gentle Page MVP default margin is 0.75 inches on every side.

Defaults are created through `createDefaultPublicationDocumentSettings()` so each publication receives independent nested objects rather than shared mutable references.

Duplicated publications receive an independent copy of document settings.

The persisted workspace advances from version 2 to version 3. Version 2 publications are migrated by adding the default document settings. Version 1 migration remains supported and now adds both empty content and default document settings.

## Consequences

Print-oriented features can rely on explicit physical document geometry without coupling layout rules to UI components.

The MVP remains intentionally opinionated: users do not configure page size, orientation, or margins yet. The domain contract can widen later if product requirements justify additional formats or controls.

Existing local publications remain readable through explicit migrations.
