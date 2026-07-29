# Layout patterns

Layout patterns compose native HTML semantics into stable structures used across
The Gentle Page Studio. They sit above primitives and below product features.

## PageHeader

Use `PageHeader` once near the beginning of a page.

```tsx
import { PageHeader } from '@/design-system/layouts'

<PageHeader
  eyebrow="Workspace"
  title="Publications"
  description="Create, organize, and continue your work."
  actions={<Button>Create publication</Button>}
/>
```

The component always renders its `title` as the page's `h1`.

## Section

Use `Section` to group related page content.

```tsx
import { Section } from '@/design-system/layouts'

<Section
  title="Recent publications"
  description="Continue editing your latest work."
  actions={<Button variant="secondary">View all</Button>}
>
  <PublicationGrid />
</Section>
```

The default heading level is `h2`. Use `headingLevel` when the surrounding
document outline requires `h3` or `h4`.

## Toolbar

Use `Toolbar` for a group of controls associated with the current page,
section, or editor context.

```tsx
import { Toolbar } from '@/design-system/layouts'

<Toolbar
  aria-label="Publication tools"
  start={<SearchInput />}
  end={<Button>New publication</Button>}
/>
```

Provide an accessible name with `aria-label` or `aria-labelledby` whenever the
toolbar role is used.

## Dependency direction

```text
app
↓
studio
↓
design-system
↓
core
```

Product features may compose these patterns. Layout patterns must not import
from `studio` or `app`.
