import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './Select.module.css'

export const selectVariants = cva(styles.select, {
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

export type SelectVariantProps = VariantProps<
  typeof selectVariants
>

export type SelectSize = NonNullable<
  SelectVariantProps['size']
>
