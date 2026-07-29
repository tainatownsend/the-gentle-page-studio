import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import { useFieldContext } from '../Field/FieldContext'
import styles from './Input.module.css'
import {
  inputRootVariants,
  type InputSize,
} from './inputVariants'

export type InputProps = {
  size?: InputSize
  invalid?: boolean
  fullWidth?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  inputClassName?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>

function mergeIds(
  first?: string,
  second?: string,
): string | undefined {
  return [first, second].filter(Boolean).join(' ') || undefined
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      size = 'md',
      invalid,
      fullWidth = false,
      startAdornment,
      endAdornment,
      className,
      inputClassName,
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
      <span
        className={cn(
          inputRootVariants({
            size,
            invalid: resolvedInvalid,
            fullWidth,
          }),
          className,
        )}
        data-disabled={disabled || undefined}
        data-invalid={resolvedInvalid || undefined}
      >
        {startAdornment && (
          <span
            className={styles.adornment}
            aria-hidden="true"
            data-testid="input-start-adornment"
          >
            {startAdornment}
          </span>
        )}

        <input
          {...props}
          ref={ref}
          id={resolvedId}
          className={cn(styles.input, inputClassName)}
          disabled={disabled}
          required={resolvedRequired}
          aria-describedby={resolvedAriaDescribedBy}
          aria-invalid={resolvedAriaInvalid}
        />

        {endAdornment && (
          <span
            className={styles.adornment}
            aria-hidden="true"
            data-testid="input-end-adornment"
          >
            {endAdornment}
          </span>
        )}
      </span>
    )
  },
)
