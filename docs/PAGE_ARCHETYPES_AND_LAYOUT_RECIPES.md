# Gentle Page Page Archetypes & Layout Recipes v1

Gentle Page no longer treats every content page as the same generic canvas.

## Archetypes

- `section-opener` — spacious editorial transition
- `reflection` — prompt / response-oriented page
- `checklist` — scan-friendly grouped choices
- `worksheet` — structured table / planner tool
- `content` — general editorial flow
- `empty` — fallback state

## Recipes

Each archetype maps to a layout intent rather than absolute coordinates:

- density: spacious / comfortable / compact
- whether the tool should preferably remain whole on one page
- whether whitespace should be actively balanced

These are semantic composition hints. They remain compatible with future recompilation and do not turn the Studio into a drag-and-drop desktop publishing tool.

## Visual behavior in v1

The browser/static renderer now begins reacting to structure:

- worksheet pages receive a restrained sage page cue
- reflection pages receive a warmer writing-oriented treatment
- simple section-openers receive a more intentional spacious composition

## Next

PR0037 will recognize compound journal tools such as Daily Compass, Weekly Reset, Monthly Reset, check-ins, and dashboards so an entire tool can be composed as one designed unit instead of a stream of independent blocks.
