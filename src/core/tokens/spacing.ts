export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const

export type SpacingToken = keyof typeof spacing
export type SpacingValue = (typeof spacing)[SpacingToken]