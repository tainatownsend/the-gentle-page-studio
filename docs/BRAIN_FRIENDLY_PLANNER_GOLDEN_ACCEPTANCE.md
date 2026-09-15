# Brain-Friendly Planner — Golden Editorial Acceptance

This is the final acceptance gate for the first Gentle Page Publication Compiler editorial stack.

The baseline user test produced technically valid 162-page PDFs but exposed release-blocking editorial defects: protocol syntax leaked into tables, headings were stranded on otherwise empty pages, conceptual tools were mechanically fragmented, visual hierarchy was too weak, and the publication required manual design work after compilation.

## North Star

**Paste / Upload → Compile → beautiful publication → Preview → Export**

Manual page layout is not part of the primary workflow.

## Automated golden gates

The Brain-Friendly Planner fixture must prove that:

- Gentle Page protocol syntax never reaches reader-facing output.
- table response directives remain semantic writing controls rather than disappearing.
- table checkbox directives remain semantic checkbox controls.
- fillable PDF export creates AcroForm controls for structured table cells.
- headings are not stranded on otherwise empty pages without authored intent.
- visual QA runs after pagination and recomposition.
- avoidable compound-tool fragmentation is surfaced; intrinsically multi-page tools are allowed to span pages.
- repeatable-page boundaries remain intentional and are not treated as visual defects.
- the editorial quality score remains within the release threshold for the golden fixture.

## Manual zero-touch acceptance

Generate a fresh journal using the current Gentle Page AI authoring prompt and the topic **Brain-Friendly Planner**.

1. Paste the manuscript into Gentle Page Studio.
2. Compile it.
3. Do not make any manual layout adjustments.
4. Review the first zero-touch Preview.
5. Export the static PDF.
6. Export the fillable PDF.

### Visual review

Confirm that:

- the cover looks intentionally branded as The Gentle Page;
- page background, typography, restrained sage/clay/sand/mist accents, rules, and cards feel consistent;
- section openers look intentional rather than like isolated headings;
- checklist pages read as checklist tools rather than plain text lists;
- Weekly Reset reads as one coherent journal tool even when it needs more than one page;
- Daily Compass reads as one coherent planner tool;
- response areas have useful writing space;
- rating scales are visually clear;
- tables and matrices are styled as worksheets;
- no `[[GP:...]]` text or Markdown checkbox syntax is visible;
- there are no clipped or overlapping blocks;
- there are no unexplained nearly-empty pages;
- the page count reflects editorial need rather than mechanical one-block-per-page pagination.

### Fillable review

Confirm in a real PDF viewer that:

- top-level response fields can be typed into;
- checkboxes can be selected;
- rating controls work;
- response cells inside tables can be typed into;
- checkbox cells inside matrices can be selected;
- the fillable PDF remains visually aligned with the static PDF.

## Release outcomes

- **PASS** — zero-touch output is publication-ready.
- **PASS WITH FOLLOW-UP** — only small preference-level refinements remain; no page-by-page layout work is required.
- **FAIL** — any blocking correctness defect, obvious protocol leak, widespread poor composition, or manual desktop-publishing work remains necessary.

The editorial stack must not be promoted to `main` until this gate records PASS or PASS WITH FOLLOW-UP.
