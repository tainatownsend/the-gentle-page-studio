# Publication styles

The files in this folder style the **generated publication**, not the Gentle Page Studio application chrome.

`PublicationDocumentTheme.module.css` is the source of truth for the publication-facing editorial palette and typography used by browser preview / static print output. The fillable-PDF renderer mirrors the same palette in `../export/generateFillablePublicationPdf.ts`.

New page archetypes and compound journal components should consume these publication tokens instead of introducing one-off colors or spacing rules.
