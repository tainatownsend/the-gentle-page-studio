# Steady Current targeted fix plan

Engineering sequence for issue #108 / PR #109:

1. Find the shared compiler/finalization path that sanitizes structured table cells.
2. Add failing regression fixtures for inline emphasis, `<br>`, Markdown checkboxes, and multi-line table-cell content.
3. Normalize those tokens into semantic cell content/controls before Preview and PDF planning.
4. Preserve row/cell boundaries through table parsing and output finalization.
5. Add static/fillable parity assertions.
6. Re-run the full release quality gate.
7. Regenerate The Steady Current static and fillable PDFs for manual acceptance.

Do not introduce unrelated editorial-layout changes while this regression is open.