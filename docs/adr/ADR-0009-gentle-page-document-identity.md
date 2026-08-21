# ADR-0009: Gentle Page document identity and cover

## Status

Accepted

## Context

The Studio UI and the exported publication serve different purposes. Reusing Studio UI typography directly inside publications would make editorial output sensitive to interface-level design changes.

The MVP also needs a predictable cover without introducing a cover builder or per-publication themes.

## Decision

Publication output uses a dedicated set of Gentle Page document typography tokens scoped to the publication page surface.

The initial document identity uses:

- Inter-based display and body typography;
- dedicated publication title, heading, body, line-height, and letter-spacing tokens;
- publication-specific semantic ink, paper, rule, and accent tokens that can later be specialized for print.

Publication document content renders with semantic native headings and paragraphs rather than Studio `Text` primitives. This keeps publication typography independent from UI typography behavior.

Every derived publication layout begins with a fixed Gentle Page cover page. The cover is generated from publication metadata and includes:

- The Gentle Page brand name;
- publication title;
- optional publication description;
- the brand tagline.

The cover is unnumbered. Content numbering begins at page 1.

## Consequences

Changes to Studio UI typography do not implicitly redefine publication typography.

The MVP has a consistent branded cover without adding configuration state or persistence complexity.

Future cover templates or publication themes can replace the fixed cover renderer without changing authored content.
