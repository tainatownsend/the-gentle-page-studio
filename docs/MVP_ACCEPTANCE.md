# MVP Manual Acceptance Runbook

Use this runbook for the release candidate in `release/mvp-manual-acceptance` before merging PR0028 to `main`.

The purpose of this pass is not to re-test every automated unit. It is to validate the browser experience, local persistence, print behavior, and real PDF-viewer compatibility that CI cannot prove.

## 1. Automated prerequisites

Before manual acceptance, confirm:

- `npm ci` succeeds
- `npm audit --audit-level=high` succeeds
- `npm run quality` succeeds
- GitHub Quality is green for PR0028
- no temporary consolidation workflow remains in the branch

## 2. Local startup

From the repository root:

```bash
git fetch origin --prune
git switch release/mvp-manual-acceptance
git pull --ff-only origin release/mvp-manual-acceptance
npm ci
npm audit --audit-level=high
npm run quality
npm run dev
```

Open the Vite URL shown in the terminal.

For a clean acceptance pass, prefer a private/incognito browser window so acceptance data is isolated from prior local-storage test data.

## 3. Publication creation and templates

Create publications using each starter:

- Blank publication
- Guided journal
- Daily check-in

Confirm:

- `/publications/new` is a dedicated creation route
- Blank remains the default starter
- each template creates the expected starter content
- template-created blocks are fully editable
- creating the same template twice does not couple the publications
- creation opens the editor directly

## 4. Publication lifecycle

Confirm:

- save as Draft
- publish explicitly
- edit a Published publication and confirm it returns to Draft
- duplicate a publication
- delete a publication and confirm destructive confirmation
- leave the editor with unsaved changes and verify discard protection

## 5. Autosave and draft recovery

In an existing Draft:

1. change the title and at least one content block
2. wait at least one second without pressing Save
3. reload the browser tab
4. reopen the publication if necessary

Confirm:

- unsaved work is recovered
- the editor indicates that unsaved changes were recovered
- explicit Save clears recovery state
- explicit Discard clears recovery state
- a recovery created for an older saved version never overwrites a newer saved publication

## 6. Content editor

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

## 7. Asset library

Open the Asset library from Publications.

Confirm:

- PNG, JPEG, or WebP image upload succeeds within the documented size limit
- preview renders correctly
- file name and approximate size are shown
- asset remains after reload
- unsupported or oversized files show an error without breaking the page
- deleting an asset removes it permanently
- returning to Publications works

The MVP asset library is intentionally independent from publication content; asset placement inside a publication is not part of this acceptance pass.

## 8. Preview and document layout

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

## 9. Static PDF / print

Use `Print / Save as PDF` and confirm:

- browser print dialog opens
- Studio controls are not printed
- output uses Letter portrait
- margins remain consistent
- page breaks match preview pages
- page numbering remains correct
- cover and content order are preserved

Save one static PDF for comparison with the fillable export.

## 10. Fillable PDF

Use `Download fillable PDF` on a publication containing both interactive field types.

Validate the downloaded file in at least:

- one browser PDF viewer
- one desktop PDF reader when available, such as Adobe Acrobat Reader

In each viewer that supports form editing, confirm:

- filename is deterministic and filesystem-friendly
- PDF opens without repair/corruption warnings
- multiline field accepts multiple lines
- checkbox can be toggled
- save the filled PDF
- close and reopen it
- entered text and checkbox state persist
- print/export the filled PDF from the viewer
- cover, margins, page numbers, content order, and field appearance remain correct

Record the PDF viewer name and version for any compatibility problem.

## 11. Fillable-export resilience

If practical, interrupt or provoke one export failure (for example by temporarily blocking the download in browser controls).

Confirm:

- an accessible error is shown
- the publication remains unchanged
- the fillable export action becomes available again
- retry clears stale error feedback
- static `Print / Save as PDF` remains independent

If a safe failure cannot be reproduced manually, automated coverage is sufficient for this item.

## 12. Version history and comparison

Create at least two explicit Published versions with observable differences.

Confirm:

- version history is newest first
- ordinary Draft saves do not create revisions
- `Compare with previous` shows a read-only change summary
- title/description changes are reported
- added, removed, changed, and moved blocks are reported when applicable
- restore creates a new Draft rather than overwriting the current publication
- previous history remains intact after restore

## 13. Theme and responsive smoke test

Confirm the Studio remains usable in:

- light mode
- dark mode
- desktop width
- narrow/mobile width

No controls should overflow their cards or become unreachable.

Pay particular attention to:

- Publications header actions
- template cards
- editor block controls
- Preview actions
- Version history actions
- Asset library grid and upload control

## 14. Acceptance result

Record one of:

- **PASS** — no blocking defects found
- **PASS WITH FOLLOW-UP** — MVP works; non-blocking compatibility or polish issues recorded
- **FAIL** — a blocking defect prevents publication creation, persistence/recovery, export, or revision recovery

For every failed item, capture:

- exact action taken
- expected result
- actual result
- browser and version
- PDF viewer and version when applicable
- screenshot when visual
- console error when present

## 15. Merge rule

PR0028 remains a release candidate until this runbook reaches **PASS** or **PASS WITH FOLLOW-UP** with no blocking defects. Only then should it be squash-merged to `main`.
