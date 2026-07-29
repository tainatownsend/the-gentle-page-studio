import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './Checkbox.module.css'

export const checkboxControlVariants = cva(styles.control, {
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

export const checkboxLabelVariants = cva(styles.labelText, {
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

export type CheckboxControlVariantProps = VariantProps<
  typeof checkboxControlVariants
>

export type CheckboxSize = NonNullable<
  CheckboxControlVariantProps['size']
>
