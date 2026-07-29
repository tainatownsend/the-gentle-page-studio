# ADR 0003: Semantic design tokens

- Status: Accepted

## Context

Components need to support themes and preserve a consistent editorial visual
language.

Raw color and spacing values make theme evolution and visual consistency more
difficult.

## Decision

Components use semantic CSS variables for color, spacing, radius, shadow,
typography, and motion.

Raw colors are not allowed inside component styles.

## Consequences

- Theme changes remain centralized.
- Light and dark themes can share component implementations.
- New visual values should first be considered at the token layer.
