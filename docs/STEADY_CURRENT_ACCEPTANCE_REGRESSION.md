# The Steady Current — Real-Product Acceptance Regression

## Status

**FAIL — customer acceptance**

The real-product acceptance run for *The Steady Current: An ADHD Workbook for Emotional Regulation* exposed defects that were not covered by the previous automated golden acceptance suite.

## Reproducible defects

The same source-syntax leakage appears in both static and fillable PDF output, so the primary defect is in the shared manuscript/compiler/finalization pipeline rather than only the fillable PDF serializer.

Observed failures:

- raw HTML line-break markers such as `<br>` are printed reader-facing;
- Markdown emphasis such as `**Head & Face**` and `**1. The Behavior**` is printed literally;
- Markdown checkbox syntax such as `- [ ]` is printed literally;
- structured table/matrix content can escape the table and continue as plain text below it;
- worksheet composition is therefore no longer semantically intact even when the exported PDF itself is valid.

## Product rule

The AI/manuscript representation is source code. Reader-facing Preview, static PDF, and fillable PDF must receive already-normalized semantic publication blocks.

No reader-facing output may expose manuscript protocol, Markdown formatting syntax, HTML formatting markers, or raw checkbox tokens.

## Fix scope

1. Reproduce these failures in automated tests using representative content from the Steady Current failure classes.
2. Normalize inline Markdown/HTML syntax before structured table-cell content reaches publication rendering.
3. Preserve table/matrix row integrity through compilation/finalization.
4. Confirm the same semantic model feeds Preview, static print rendering, and fillable PDF planning.
5. Add explicit regression assertions for zero leakage of `<br>`, `**...**`, and raw `- [ ]` tokens.
6. Avoid broad layout tuning unrelated to this real-product failure.

## Acceptance gate

PASS requires all of the following:

- zero source-syntax leakage;
- no structured table rows escaping into plain text;
- no manuscript content loss;
- no clipping or overlap;
- static and fillable output remain visually coherent and semantically equivalent;
- fillable controls remain interactive and preserve saved values after reopen;
- zero manual layout intervention for the optimized manuscript path.

The failing static and fillable PDFs from the September 16, 2026 manual acceptance run remain the baseline evidence for this regression.