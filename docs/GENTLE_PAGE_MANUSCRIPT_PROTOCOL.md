# Gentle Page Manuscript Protocol v1

## Purpose

Gentle Page Studio is a publication compiler. The authoring source is a manuscript, not a finished page layout.

The protocol gives ChatGPT, Gemini, Claude, and other writing tools a small set of semantic markers that Gentle Page Studio can interpret deterministically while keeping the manuscript readable by humans.

North Star UX:

> Paste. Compile. Preview. Export.

The compiler owns typography, spacing, page composition, pagination, and final output. The manuscript owns content and semantic intent.

## Authoring rules

Use ordinary Markdown whenever Markdown already expresses the intent.

```md
# Publication title

## Major section

### Subsection or reflection prompt

Normal paragraph.

- Bullet item
- Bullet item

1. Numbered item
2. Numbered item

- [ ] Checkbox option
- [ ] Another option
```

Do not use underscore rows or repeated spaces to simulate writing areas. Use a response directive instead.

## Response fields

```text
[[GP:RESPONSE size="short"]]
[[GP:RESPONSE size="medium"]]
[[GP:RESPONSE size="long"]]
```

The size is an editorial intent, not a fixed physical height. The layout engine may adjust the final field height within Gentle Page design-system limits to improve page composition.

A level-three heading or question immediately before a response directive is treated as the response prompt.

```md
### What do I need today?

[[GP:RESPONSE size="long"]]
```

## Rating fields

Use a rating directive when the reader should choose one value from a bounded numeric scale.

```md
### Energy right now

[[GP:RATING min="0" max="10"]]
```

The preceding level-three heading or question becomes the rating prompt. The compiler renders the scale as a first-class publication component and, in fillable PDF output, as one radio group with stable options.

Keep rating ranges compact. Invalid or reversed ranges are normalized safely rather than blocking compilation.

## Structured worksheets and tables

Use normal Markdown tables for matrices, trackers, worksheets, or other tabular content.

```md
| Area | Current capacity | What would make it easier? |
| --- | --- | --- |
| Physical | Low | More rest |
| Mental | Medium | Fewer decisions |
| Emotional | Low | More support |
```

Gentle Page Studio preserves the table as structured rows and columns. Do not convert worksheet tables into manually aligned spaces or plain-text columns.

The compiler owns column sizing and page composition. The manuscript owns cell content and table structure.

## Checkbox groups

Use ordinary Markdown task-list syntax:

```md
- [ ] Reduce expectations
- [ ] Ask for help
- [ ] Protect a break
```

Consecutive checkbox options are treated as a semantic group for pagination. When the group fits on a fresh page, the layout engine avoids stranding only the final options on the next page.

## Page-break intent

Preferred break:

```text
[[GP:PAGE_BREAK type="preferred"]]
```

Use this when starting the following content on a new page would normally improve editorial flow. The compiler may keep it on the current page when honoring the break would create excessive unused space.

Forced break:

```text
[[GP:PAGE_BREAK type="forced"]]
```

Use this only when the following content must begin on a new page.

For convenience, this is equivalent to a preferred break:

```text
[[GP:PAGE_BREAK]]
```

## Author-only notes

Use author notes for design, product, or implementation context that must not appear in the final publication.

```text
[[GP:AUTHOR_NOTE]]
Keep this exercise visually spacious and non-demanding.
[[GP:END]]
```

Author notes are excluded from publication output.

## Forward-compatible directives

The protocol is intentionally small in v1. Repeatable-page semantics and additional structured journal components remain planned extensions.

When the compiler encounters a directive it does not yet support, it must preserve the information or surface a non-blocking diagnostic rather than silently dropping manuscript content.

## Content-preservation rule

Compilation must not summarize, rewrite, simplify, or silently remove approved manuscript content.

Allowed non-output material is limited to:

- protocol directives that become publication semantics;
- explicit author-only notes;
- formatting artifacts that have been safely normalized.

## Official AI authoring prompt

Copy the instructions below into ChatGPT, Gemini, Claude, or another AI before asking it to create a Gentle Page manuscript.

```text
GENTLE PAGE STUDIO — MANUSCRIPT AUTHORING INSTRUCTIONS

You are creating content that will be compiled by Gentle Page Studio into a polished journal, workbook, planner, or ebook.

Your responsibility is CONTENT AND SEMANTIC STRUCTURE.

Do not design pages.
Do not simulate visual layout.
Do not add decorative spacing.
Do not use underscore lines to represent writing areas.
Do not manually align worksheet columns with spaces.
Do not attempt to optimize final pagination.

Gentle Page Studio will handle typography, spacing, fields, layout, pagination, visual composition, and PDF generation.

FORMAT

Use Markdown headings:
# Publication title
## Major section
### Subsection or reflection prompt

Use normal Markdown paragraphs and lists.
Use `- [ ] Option` for checkbox choices.
Use Markdown tables for worksheets, trackers, matrices, and other genuinely tabular content.

INTERACTIVE FIELDS

For a short written response:
[[GP:RESPONSE size="short"]]

For a medium written response:
[[GP:RESPONSE size="medium"]]

For a long reflection:
[[GP:RESPONSE size="long"]]

For a numeric rating scale:
### Energy right now
[[GP:RATING min="0" max="10"]]

PAGE INTENT

Use:
[[GP:PAGE_BREAK type="preferred"]]
when a new page would normally improve editorial flow.

Use:
[[GP:PAGE_BREAK type="forced"]]
only when the following content must begin on a new page.

Do not add page breaks merely to make the manuscript look attractive. Gentle Page Studio performs final pagination.

AUTHOR NOTES

For design, product, or implementation notes that should NOT appear in the final publication:
[[GP:AUTHOR_NOTE]]
Your note here.
[[GP:END]]

WRITING PRINCIPLE

Create the best possible manuscript, not a finished PDF.
Express editorial intent, not physical layout.
Gentle Page Studio will transform the manuscript into the final publication.
```

## Acceptance direction

Optimized-input benchmark:

1. generate a manuscript with the protocol;
2. paste it into Gentle Page Studio;
3. compile;
4. make no manual layout edits;
5. export and evaluate the result.

The target is zero mandatory import questions and zero manual layout interventions for a well-formed protocol manuscript.
