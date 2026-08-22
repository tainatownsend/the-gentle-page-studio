# MVP Acceptance Checklist

Use this checklist for the first end-to-end validation of The Gentle Page Studio after the PR0027 stack is merged or when testing the latest stacked branch locally.

## Automated prerequisites

Before manual acceptance, confirm:

- `npm ci` succeeds
- `npm run quality` succeeds
- GitHub Quality is green for the branch under test
- no unresolved high-severity dependency findings remain in the accepted lockfile

## Local startup

```bash
npm ci
npm run quality
npm run dev
```

Open the Vite URL shown in the terminal.

## Publication lifecycle

- create a new publication from `/publications/new`
- confirm creation opens the editor directly
- add title and description
- save as Draft
- publish explicitly
- edit a Published publication and confirm it returns to Draft
- leave the editor with unsaved changes and verify discard protection
- duplicate a publication
- delete a publication and confirm destructive confirmation

## Content editor

Create a publication containing, in this order:

1. Heading
2. Paragraph
3. Multiline response field
4. Checkbox
5. Another paragraph long enough to exercise automatic pagination

Validate:

- add/remove controls
- move up/down boundaries
- duplicate block
- independent editing after duplication
- heading level selection
- long content wraps without leaving the page surface

## Preview and document layout

Confirm:

- US Letter portrait proportions
- Gentle Page cover appears first
- cover is unnumbered
- content numbering starts at page 1
- page numbers are bottom center
- fixed Gentle Page typography is legible
- automatic pagination preserves authored order
- no block is visually clipped across page boundaries
- multiline response area and checkbox affordance appear in preview

## Static PDF / print

Use `Print / Save as PDF` and confirm:

- browser print dialog opens
- Studio controls are not printed
- output uses Letter portrait
- margins remain consistent
- page breaks match preview pages
- page numbering remains correct
- cover and content order are preserved

## Fillable PDF

Use `Download fillable PDF` on a publication containing interactive fields.

Confirm:

- filename is deterministic and filesystem-friendly
- downloaded PDF opens successfully
- multiline field accepts multiple lines
- checkbox can be toggled
- save the filled PDF
- close and reopen it
- entered text and checkbox state persist
- print/export the filled PDF from the viewer
- cover, margins, page numbers, content order, and field appearance remain correct

Record the PDF viewer and version if any compatibility problem appears.

## Version history

Create at least two explicit Published versions.

Confirm:

- version history is newest first
- ordinary Draft saves do not create revisions
- `Compare with previous` shows a read-only change summary
- title/description changes are reported
- added, removed, changed, and moved blocks are reported when applicable
- restore creates a new Draft rather than overwriting the current publication
- previous history remains intact after restore

## Theme and responsive smoke test

Confirm the Studio remains usable in:

- light mode
- dark mode
- desktop width
- narrow/mobile width

No controls should overflow their cards or become unreachable.

## Acceptance result

Record one of:

- **PASS** — no blocking defects found
- **PASS WITH FOLLOW-UP** — MVP works; non-blocking compatibility or polish issues recorded
- **FAIL** — blocking defect prevents publication creation, export, persistence, or revision recovery

For every failed item, capture:

- exact action taken
- expected result
- actual result
- browser / PDF viewer
- screenshot when visual
- console error when present
