import {
  darkColors,
  lightColors,
  motion,
  radius,
  shadows,
  spacing,
  typography,
} from '@/core/tokens'

type CssVariableMap = Record<`--${string}`, string>

function px(value: number) {
  return `${value}px`
}

function ms(value: number) {
  return `${value}ms`
}

function createColorVariables(
  colors: typeof lightColors | typeof darkColors,
): CssVariableMap {
  return {
    '--color-surface-primary': colors.surface.primary,
    '--color-surface-secondary': colors.surface.secondary,
    '--color-surface-tertiary': colors.surface.tertiary,

    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-tertiary': colors.text.tertiary,
    '--color-text-inverse': colors.text.inverse,

    '--color-border-default': colors.border.default,
    '--color-border-subtle': colors.border.subtle,
    '--color-border-strong': colors.border.strong,

    '--color-accent-primary': colors.accent.primary,
    '--color-accent-hover': colors.accent.hover,
    '--color-accent-active': colors.accent.active,
    '--color-accent-soft': colors.accent.soft,
    '--color-accent-contrast': colors.accent.contrast,

    '--color-feedback-success': colors.feedback.success,
    '--color-feedback-warning': colors.feedback.warning,
    '--color-feedback-danger': colors.feedback.danger,
    '--color-feedback-info': colors.feedback.info,
  }
}

export const sharedCssVariables: CssVariableMap = {
  '--font-family-sans': typography.fontFamily.sans,

  '--font-size-caption': px(typography.fontSize.caption),
  '--font-size-body-small': px(typography.fontSize.bodySmall),
  '--font-size-body': px(typography.fontSize.body),
  '--font-size-h3': px(typography.fontSize.h3),
  '--font-size-h2': px(typography.fontSize.h2),
  '--font-size-h1': px(typography.fontSize.h1),
  '--font-size-display': px(typography.fontSize.display),

  '--line-height-caption': px(typography.lineHeight.caption),
  '--line-height-body-small': px(typography.lineHeight.bodySmall),
  '--line-height-body': px(typography.lineHeight.body),
  '--line-height-h3': px(typography.lineHeight.h3),
  '--line-height-h2': px(typography.lineHeight.h2),
  '--line-height-h1': px(typography.lineHeight.h1),
  '--line-height-display': px(typography.lineHeight.display),

  '--font-weight-regular': String(typography.fontWeight.regular),
  '--font-weight-medium': String(typography.fontWeight.medium),
  '--font-weight-semibold': String(typography.fontWeight.semibold),
  '--font-weight-bold': String(typography.fontWeight.bold),

  '--letter-spacing-tight': `${typography.letterSpacing.tight}em`,
  '--letter-spacing-normal': `${typography.letterSpacing.normal}em`,
  '--letter-spacing-wide': `${typography.letterSpacing.wide}em`,

  '--space-none': px(spacing.none),
  '--space-xxs': px(spacing.xxs),
  '--space-xs': px(spacing.xs),
  '--space-sm': px(spacing.sm),
  '--space-md': px(spacing.md),
  '--space-lg': px(spacing.lg),
  '--space-xl': px(spacing.xl),
  '--space-2xl': px(spacing['2xl']),
  '--space-3xl': px(spacing['3xl']),
  '--space-4xl': px(spacing['4xl']),

  '--radius-none': px(radius.none),
  '--radius-xs': px(radius.xs),
  '--radius-sm': px(radius.sm),
  '--radius-md': px(radius.md),
  '--radius-lg': px(radius.lg),
  '--radius-xl': px(radius.xl),
  '--radius-full': px(radius.full),

  '--shadow-none': shadows.none,
  '--shadow-xs': shadows.xs,
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,

  '--motion-duration-fast': ms(motion.duration.fast),
  '--motion-duration-normal': ms(motion.duration.normal),
  '--motion-duration-slow': ms(motion.duration.slow),

  '--motion-easing-standard': motion.easing.standard,
  '--motion-easing-emphasized': motion.easing.emphasized,
  '--motion-easing-exit': motion.easing.exit,
}

export const lightCssVariables = createColorVariables(lightColors)
export const darkCssVariables = createColorVariables(darkColors)