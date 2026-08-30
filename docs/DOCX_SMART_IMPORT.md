# DOCX Smart Import

Gentle Page Studio treats Word as a manuscript source, not as the final layout authority.

## Pipeline

`.docx` → OOXML structure → Gentle Page Manuscript → Publication compiler → Smart Pagination → Preview / Export

The Word importer preserves document order and reads the package directly in the browser without adding a runtime dependency.

## v1 mappings

- Word Title style → publication title
- Heading 1 → major section
- Heading 2+ → subsection/prompt heading
- paragraph order → manuscript order
- Word numbering → Markdown list intent
- checkbox glyphs (`☐`, `□`, `[ ]`) → checkbox fields
- consecutive underscore-only paragraphs → Short / Medium / Long response intent
- `pageBreakBefore` → preferred Gentle Page page break
- manual Word page break → forced Gentle Page page break
- Word tables → structured Markdown preservation in row/cell order
- likely internal note labels → author-only content

## Product rule

The importer must not copy Word page geometry. Word structure and break metadata are inputs to the Gentle Page compiler; final page composition belongs to Smart Pagination.

## Zero-touch target

Uploading a valid `.docx` should require no import configuration. The converted manuscript remains visible as an escape hatch, but compilation is not blocked by optional suggestions.

## Current boundary

Tables are preserved structurally in v1, but first-class Gentle Page table rendering is a separate compiler increment. No cell content should be discarded while that renderer is pending.
