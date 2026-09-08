# ADR-0008: Derived publication layout

## Status

Accepted

## Context

The MVP uses automatic pagination. Persisting manual page boundaries would couple authored content to transient layout details such as typography, margins, and future pagination measurements.

The Studio still needs a page-oriented representation that preview and export features can consume without changing the semantic content model.

## Decision

Authored publication content remains a single ordered stream of semantic blocks.

A separate `PublicationLayout` projection is derived from a publication and its document settings. The projection owns page objects used by presentation and export layers.

The initial layout projection produces one content page while establishing the stable boundary where measurement-based automatic pagination can be introduced later.

Layout pages receive independent block objects and independent document settings so layout work cannot mutate persisted publication data.

The preview renders the derived layout as a responsive US Letter portrait canvas. Screen scaling preserves the 8.5:11 page ratio, and a bottom-center page-number area is reserved from the first version.

## Consequences

Publication persistence stays focused on authored content rather than generated layout artifacts.

Future pagination can change how `PublicationLayout.pages` are produced without requiring another publication-storage migration.

Preview and export can share the same derived layout contract.

The initial projection does not yet split overflowing content across multiple pages; that remains a layout-engine responsibility before static PDF validation is complete.
