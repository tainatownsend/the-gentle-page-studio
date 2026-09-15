# Gentle Page Compound Journal Components v1

Compound components are editorial units made from several semantic blocks that should be composed together when practical.

## Initial patterns

- heading + checkbox set → checklist section
- heading + table → worksheet section
- heading + response field(s) → guided reflection
- heading + rating field(s) → rating section

## Why this matters

A generic block paginator can leave a heading on one page and move the checklist or worksheet it introduces to the next page. The Brain-Friendly Planner acceptance exposed this visibly with sections such as Remembering and Prioritizing.

The pagination engine now recognizes these compound units and moves the heading with the complete unit when the group fits on a fresh page.

## AI authoring guidance

The official AI prompt now also asks writing models to preserve conceptual grouping:

- one conceptual tool stays under one major heading
- selectable options use checkbox syntax
- response directives sit directly after their prompt
- page breaks are not inserted before every small step

This improves the source manuscript before the compiler applies its own semantic and editorial logic.

## Next

PR0038 will add cross-page editorial recomposition so larger tools such as Weekly Reset and Daily Compass can be consolidated and balanced across fewer, better-composed pages rather than merely keeping local subgroups together.
