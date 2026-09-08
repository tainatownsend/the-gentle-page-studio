# ADR-0006 — Editorial Output Defaults

## Status

Accepted

## Context

The Gentle Page Studio is moving from a generic block-based publication editor toward page-based printable journals. The MVP needs stable editorial defaults so implementation can proceed without exposing premature customization controls.

## Decision

For the MVP:

- Page size is US Letter.
- Orientation is portrait only.
- Margins and safe areas use fixed Gentle Page defaults.
- Pagination uses automatic content flow.
- Page numbers appear at the bottom center.
- Publication typography uses the fixed Gentle Page identity.
- The cover is generated as the first publication page using a fixed Gentle Page layout derived from publication metadata.
- Per-publication visual theme customization is not supported.
- Static PDF export is implemented before fillable PDF.

For the first fillable-PDF iteration after static export is stable:

- start with multiline text fields and checkboxes;
- author them as explicit editor blocks rather than inferring interactivity during export.

For versioning:

- an explicit publish event creates an immutable published snapshot;
- draft saves do not create versions;
- published snapshots are retained without an MVP cap while storage remains local;
- restoring a historical snapshot creates a new draft rather than overwriting history.

## Consequences

- The document model can use deterministic defaults instead of adding settings UI immediately.
- Print preview and PDF work can target one page geometry first.
- Automatic pagination avoids manual page-management complexity in the MVP.
- Fixed Gentle Page styling keeps the first product visually coherent and reduces configuration surface.
- Fillable export and revision history remain compatible with later expansion without blocking the static publication workflow.
