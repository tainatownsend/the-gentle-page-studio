export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgb(31 37 34 / 0.05)',
  sm: '0 2px 8px rgb(31 37 34 / 0.08)',
  md: '0 8px 24px rgb(31 37 34 / 0.10)',
  lg: '0 16px 40px rgb(31 37 34 / 0.12)',
} as const

export type ShadowToken = keyof typeof shadows
export type ShadowValue = (typeof shadows)[ShadowToken]