# The Steady State — Template Map v1

Status: APPROVED IMPLEMENTATION MAPPING  
Brand: The Gentle Page  
Collection: A — Calm & Classic

This map connects the locked 20-page product architecture to the semantic page-template contract supported by Gentle Page Studio.

The template value communicates page intent. It does not authorize manuscript rewriting or manual pixel layout.

| # | Canonical page | Studio template |
| --- | --- | --- |
| 1 | Cover | built-in cover |
| 2 | Table of Contents | navigation |
| 3 | Welcome / Let's Begin | section-opener |
| 4 | How to Use This Journal | navigation |
| 5 | Quote / Emotional Opener | section-opener |
| 6 | The 4-State Self-Scan | guided-framework |
| 7 | Emergency Unfreeze Protocol | emergency-tool |
| 8 | Daily Check-In | daily-check-in |
| 9 | Daily Regulation Tools Overview | tool-overview |
| 10 | Sensory Reset | sensory-reset |
| 11 | Thought Download | prompt-writing |
| 12 | Nervous System Basics / 101 | guided-framework |
| 13 | Triggers & Early Signs | guided-framework |
| 14 | Regulation Menu | matrix-framework |
| 15 | Weekly Reset | weekly-reset |
| 16 | Weekly Plan | planner-tracker |
| 17 | Deep Dive Example | guided-framework |
| 18 | Reflection | prompt-writing |
| 19 | Goal Planner | planner-tracker |
| 20 | Closing Page / You've Got This | closing |

## Gate A canonical acceptance pages

The first production fidelity gate remains:

1. Cover
2. The 4-State Self-Scan → `guided-framework`
3. Emergency Unfreeze Protocol → `emergency-tool`
4. Daily Check-In → `daily-check-in`

These pages define the execution standard for later pages.

## No-regression rules

- no side or vertical tabs;
- no corrupted labels;
- no random language switching;
- no dense app-like card grids;
- no tiny type as an overflow workaround;
- no dead lower-half page space;
- no arbitrary component sizes;
- no raw Markdown, HTML, or Gentle Page directives in reader-facing output.

## Manuscript annotation example

```md
[[GP:PAGE_TEMPLATE type="guided-framework"]]

## The 4-State Self-Scan

...

[[GP:PAGE_TEMPLATE type="emergency-tool"]]

## Emergency Unfreeze Protocol

...
```

Each explicit template starts on a fresh derived content page. The Studio remains responsible for final typography, spacing, geometry, pagination, preview, print output, and fillable-PDF rendering.
