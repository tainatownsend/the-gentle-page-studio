import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './Textarea.module.css'

export const textareaVariants = cva(styles.textarea, {
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
    resize: {
      none: styles.resizeNone,
      vertical: styles.resizeVertical,
      horizontal: styles.resizeHorizontal,
      both: styles.resizeBoth,
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
    fullWidth: false,
    resize: 'vertical',
  },
})

export type TextareaVariantProps = VariantProps<
  typeof textareaVariants
>

export type TextareaSize = NonNullable<
  TextareaVariantProps['size']
>

export type TextareaResize = NonNullable<
  TextareaVariantProps['resize']
>
