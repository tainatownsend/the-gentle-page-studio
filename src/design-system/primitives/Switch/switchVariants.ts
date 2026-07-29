import {
  cva,
  type VariantProps,
} from 'class-variance-authority'

import styles from './Switch.module.css'

export const switchTrackVariants = cva(styles.track, {
  variants: {
    size: {
      sm: styles.trackSm,
      md: styles.trackMd,
      lg: styles.trackLg,
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

export const switchThumbVariants = cva(styles.thumb, {
  variants: {
    size: {
      sm: styles.thumbSm,
      md: styles.thumbMd,
      lg: styles.thumbLg,
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const switchLabelVariants = cva(styles.labelText, {
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

export type SwitchTrackVariantProps = VariantProps<
  typeof switchTrackVariants
>

export type SwitchSize = NonNullable<
  SwitchTrackVariantProps['size']
>
