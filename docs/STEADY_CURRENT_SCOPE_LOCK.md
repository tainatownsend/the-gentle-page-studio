# Steady Current scope lock

PR #109 is a targeted real-product regression fix.

In scope:
- shared compiler/finalization normalization for structured table cells;
- preservation of table/matrix boundaries;
- regression coverage for raw Markdown/HTML/checkbox leakage;
- parity validation across preview/static/fillable output.

Out of scope unless directly required by a reproduced failure:
- new templates;
- broad page-archetype redesign;
- palette/typography changes;
- speculative pagination tuning;
- unrelated Studio workflow changes.
