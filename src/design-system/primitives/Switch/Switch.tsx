import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import { useFieldContext } from '../Field/FieldContext'
import styles from './Switch.module.css'
import {
  switchLabelVariants,
  switchThumbVariants,
  switchTrackVariants,
  type SwitchSize,
} from './switchVariants'

export type SwitchProps = {
  label: ReactNode
  size?: SwitchSize
  invalid?: boolean
  fullWidth?: boolean
  labelPosition?: 'start' | 'end'
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
>

function mergeIds(
  first?: string,
  second?: string,
): string | undefined {
  return [first, second].filter(Boolean).join(' ') || undefined
}

export const Switch = forwardRef<
  HTMLInputElement,
  SwitchProps
>(function Switch(
  {
    label,
    size = 'md',
    invalid,
    fullWidth = false,
    labelPosition = 'end',
    className,
    disabled,
    id,
    required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const fieldContext = useFieldContext()

  const resolvedId = id ?? fieldContext?.controlId
  const resolvedInvalid =
    invalid ?? fieldContext?.invalid ?? false
  const resolvedRequired =
    required ?? fieldContext?.required

  const resolvedAriaDescribedBy = mergeIds(
    ariaDescribedBy,
    fieldContext?.describedBy,
  )

  const resolvedAriaInvalid =
    ariaInvalid ?? (resolvedInvalid || undefined)

  const control = (
    <span className={styles.controlWrapper}>
      <input
        {...props}
        ref={ref}
        id={resolvedId}
        type="checkbox"
        role="switch"
        className={cn(styles.input, className)}
        disabled={disabled}
        required={resolvedRequired}
        aria-describedby={resolvedAriaDescribedBy}
        aria-invalid={resolvedAriaInvalid}
        data-disabled={disabled || undefined}
        data-invalid={resolvedInvalid || undefined}
      />

      <span
        className={switchTrackVariants({
          size,
          invalid: resolvedInvalid,
        })}
        aria-hidden="true"
      >
        <span className={switchThumbVariants({ size })} />
      </span>
    </span>
  )

  const labelContent = (
    <span className={switchLabelVariants({ size })}>
      {label}

      {resolvedRequired && (
        <span
          className={styles.requiredIndicator}
          aria-hidden="true"
        >
          *
        </span>
      )}
    </span>
  )

  return (
    <label
      className={cn(
        styles.root,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      )}
      data-label-position={labelPosition}
    >
      {labelPosition === 'start' ? labelContent : control}
      {labelPosition === 'start' ? control : labelContent}
    </label>
  )
})
