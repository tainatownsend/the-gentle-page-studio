import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './RadioGroup.module.css'

export const radioGroupVariants = cva(styles.group, {
  variants: {
    orientation: {
      vertical: styles.vertical,
      horizontal: styles.horizontal,
    },
    fullWidth: {
      true: styles.fullWidth,
      false: undefined,
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    fullWidth: false,
  },
})

export const radioControlVariants = cva(styles.control, {
  variants: {
    size: {
      sm: styles.controlSm,
      md: styles.controlMd,
      lg: styles.controlLg,
    },
    invalid: {
      true: styles.invalid,
      false: undefined,
    },
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
})

export const radioLabelVariants = cva(styles.labelText, {
  variants: {
    size: {
      sm: styles.labelSm,
      md: styles.labelMd,
      lg: styles.labelLg,
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type RadioGroupVariantProps = VariantProps<
  typeof radioGroupVariants
>

export type RadioControlVariantProps = VariantProps<
  typeof radioControlVariants
>

export type RadioGroupOrientation = NonNullable<
  RadioGroupVariantProps['orientation']
>

export type RadioGroupSize = NonNullable<
  RadioControlVariantProps['size']
>
