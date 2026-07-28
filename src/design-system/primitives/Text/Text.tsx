import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from 'react'

import { colors, typography } from '@/core/tokens'

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse'

export type TextProps = {
  as?: ElementType
  children: ReactNode
  variant?: TextVariant
  tone?: TextTone
  weight?: keyof typeof typography.fontWeight
} & HTMLAttributes<HTMLElement>

const variantStyles: Record<TextVariant, CSSProperties> = {
  display: {
    fontSize: typography.fontSize.display,
    lineHeight: `${typography.lineHeight.display}px`,
    letterSpacing: `${typography.letterSpacing.tight}em`,
  },
  h1: {
    fontSize: typography.fontSize.h1,
    lineHeight: `${typography.lineHeight.h1}px`,
    letterSpacing: `${typography.letterSpacing.tight}em`,
  },
  h2: {
    fontSize: typography.fontSize.h2,
    lineHeight: `${typography.lineHeight.h2}px`,
    letterSpacing: `${typography.letterSpacing.tight}em`,
  },
  h3: {
    fontSize: typography.fontSize.h3,
    lineHeight: `${typography.lineHeight.h3}px`,
    letterSpacing: `${typography.letterSpacing.normal}em`,
  },
  body: {
    fontSize: typography.fontSize.body,
    lineHeight: `${typography.lineHeight.body}px`,
    letterSpacing: `${typography.letterSpacing.normal}em`,
  },
  bodySmall: {
    fontSize: typography.fontSize.bodySmall,
    lineHeight: `${typography.lineHeight.bodySmall}px`,
    letterSpacing: `${typography.letterSpacing.normal}em`,
  },
  caption: {
    fontSize: typography.fontSize.caption,
    lineHeight: `${typography.lineHeight.caption}px`,
    letterSpacing: `${typography.letterSpacing.wide}em`,
  },
}

const toneStyles: Record<TextTone, CSSProperties> = {
  primary: {
    color: colors.text.primary,
  },
  secondary: {
    color: colors.text.secondary,
  },
  tertiary: {
    color: colors.text.tertiary,
  },
  inverse: {
    color: colors.text.inverse,
  },
}

export function Text({
  as: Component = 'p',
  children,
  variant = 'body',
  tone = 'primary',
  weight = 'regular',
  style,
  ...props
}: TextProps) {
  return (
    <Component
      {...props}
      data-tone={tone}
      data-variant={variant}
      style={{
        margin: 0,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight[weight],
        ...variantStyles[variant],
        ...toneStyles[tone],
        ...style,
      }}
    >
      {children}
    </Component>
  )
}