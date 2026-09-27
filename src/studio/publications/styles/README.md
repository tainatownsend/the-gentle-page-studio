# Publication styles

The files in this folder style the **generated publication**, not the Gentle Page Studio application chrome.

`PublicationDocumentTheme.module.css` is the source of truth for the publication-facing editorial palette and typography used by browser preview / static print output. The fillable-PDF renderer mirrors the same palette in `../export/generateFillablePublicationPdf.ts`.

New page archetypes and compound journal components should consume these publication tokens instead of introducing one-off colors or spacing rules.


## Visual North Star v1

The publication canvas is pure white. Collection A (Calm & Classic) is the default palette for The Steady State. Decorative backgrounds must never reduce usable writing space or create accidental visual clutter.

The approved Steady State direction explicitly forbids side / edge navigation tabs. Refer to `docs/THE_GENTLE_PAGE_VISUAL_NORTH_STAR_V1.md` and `docs/STEADY_STATE_VISUAL_IMPLEMENTATION_V1.md` before changing publication-facing styles.
