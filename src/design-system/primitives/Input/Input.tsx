import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      size = 'md',
      invalid = false,
      fullWidth = false,
      startAdornment,
      endAdornment,
      className,
      inputClassName,
      disabled,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) {
    const resolvedAriaInvalid =
      ariaInvalid ?? (invalid || undefined)

    return (
      <span
        className={cn(
          inputRootVariants({
            size,
            invalid,
            fullWidth,
          }),
          className,
        )}
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
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
          className={cn(styles.input, inputClassName)}
          disabled={disabled}
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
