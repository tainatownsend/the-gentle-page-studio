# Structured Journal Components

This increment keeps high-value journal structures semantic from manuscript ingestion through Preview and PDF export.

## First-class blocks

### Table

Canonical input remains Markdown so AI tools and the DOCX importer can produce the same deterministic representation.

```md
| Area | Current capacity |
| --- | --- |
| Physical | Low |
| Mental | Medium |
```

The compiler stores this as a `table` block. Preview renders semantic HTML table markup and the PDF serializer draws an intentional grid rather than printing Markdown characters.

### Rating field

```text
### Energy right now

[[GP:RATING min="0" max="10"]]
```

The compiler consumes the preceding prompt and stores one `rating-field` block with explicit min/max semantics. Preview shows the scale and fillable PDF export creates one radio group with stable field identity.

## Correction layer

The compiler remains the default authority. Advanced editing exposes only semantic corrections:

- edit table content as Markdown;
- edit rating prompt and min/max;
- Auto / Prefer new page / Start new page;
- normal block move / duplicate / remove actions.

There is no absolute positioning or manual page geometry.

## Layout behavior

Tables and rating fields participate in Smart Pagination estimates. Multiline response fields remain the elastic page elements; tables and ratings are treated as structured, non-elastic content in this increment.

Oversized structured blocks are surfaced through existing layout-health diagnostics instead of being silently clipped by the compiler.
