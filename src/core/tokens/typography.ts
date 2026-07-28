export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  fontSize: {
    caption: 12,
    bodySmall: 14,
    body: 16,
    h3: 20,
    h2: 24,
    h1: 32,
    display: 48,
  },

  lineHeight: {
    caption: 16,
    bodySmall: 20,
    body: 24,
    h3: 28,
    h2: 32,
    h1: 40,
    display: 56,
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
  },
} as const

export type TypographyToken = typeof typography