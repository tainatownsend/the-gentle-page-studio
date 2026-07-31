import { cva, type VariantProps } from 'class-variance-authority'

import styles from './Button.module.css'

export const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      ghost: styles.ghost,
      destructive: styles.destructive,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
    fullWidth: {
      true: styles.fullWidth,
      false: undefined,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
  },
})

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>

export type ButtonSize = NonNullable<ButtonVariantProps['size']>
