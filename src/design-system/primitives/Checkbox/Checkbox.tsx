import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import { useFieldContext } from '../Field/FieldContext'
import styles from './Checkbox.module.css'
import {
  checkboxControlVariants,
  checkboxLabelVariants,
  type CheckboxSize,
} from './checkboxVariants'

export type CheckboxProps = {
  label: ReactNode
  size?: CheckboxSize
  invalid?: boolean
  fullWidth?: boolean
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

export const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(function Checkbox(
  {
    label,
    size = 'md',
    invalid,
    fullWidth = false,
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

  return (
    <label
      className={cn(
        styles.root,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      )}
    >
      <span className={styles.controlWrapper}>
        <input
          {...props}
          ref={ref}
          id={resolvedId}
          type="checkbox"
          className={cn(styles.input, className)}
          disabled={disabled}
          required={resolvedRequired}
          aria-describedby={resolvedAriaDescribedBy}
          aria-invalid={resolvedAriaInvalid}
          data-disabled={disabled || undefined}
          data-invalid={resolvedInvalid || undefined}
        />

        <span
          className={checkboxControlVariants({
            size,
            invalid: resolvedInvalid,
          })}
          aria-hidden="true"
        >
          <svg
            className={styles.checkIcon}
            viewBox="0 0 20 20"
            focusable="false"
            role="presentation"
          >
            <path
              d="m4.5 10.5 3.25 3.25L15.5 6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
      </span>

      <span className={checkboxLabelVariants({ size })}>
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
    </label>
  )
})
