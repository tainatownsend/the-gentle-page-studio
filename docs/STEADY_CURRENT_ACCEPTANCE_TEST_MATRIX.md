# The Steady Current — Acceptance Test Matrix

This matrix converts the manual failure evidence into deterministic engineering gates.

| Failure class | Representative source | Expected compiled result | Release assertion |
| --- | --- | --- | --- |
| Bold markup inside table cells | `**Head & Face**` | reader-facing `Head & Face` with semantic emphasis only | no literal `**` in Preview/PDF |
| HTML line breaks in table cells | `Clenched teeth<br><br>- [ ] Heavy eyelids` | separate semantic lines/controls inside the same cell | no literal `<br>` in Preview/PDF |
| Markdown checkboxes in table cells | `- [ ] Heavy eyelids` | checkbox control/printable checkbox intent | no raw `- [ ]` token |
| Multi-line structured cells | somatic signal matrix | all cell content remains inside its originating row/cell | no overflow into plain paragraphs below the table |
| Mixed label + checkbox cell | Daily Physiological Baseline | label and checkbox controls remain within the Fuel & Hydration cell | table remains structurally intact |
| Bold numbered row label | `**1. The Behavior**` | `1. The Behavior` with semantic emphasis | no literal Markdown markers |
| Static/fillable parity | same compiled publication model | equivalent visible content and structure | no serializer-specific content divergence |

## Required regression coverage

The implementation should test the shared compiler/finalization path first. Export-layer tests should then confirm that both static/preview rendering and fillable-PDF planning consume the same normalized structured content.

The gate fails on any reader-facing manuscript-source syntax, structured row escape, or content loss.