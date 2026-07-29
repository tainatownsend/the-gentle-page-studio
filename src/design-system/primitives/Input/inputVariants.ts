import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './Input.module.css'

export const inputRootVariants = cva(styles.root, {
  variants: {
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
    invalid: {
      true: styles.invalid,
      false: undefined,
    },
    fullWidth: {
      true: styles.fullWidth,
      false: undefined,
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
    fullWidth: false,
  },
})

export type InputVariantProps = VariantProps<
  typeof inputRootVariants
>

export type InputSize = NonNullable<
  InputVariantProps['size']
>
