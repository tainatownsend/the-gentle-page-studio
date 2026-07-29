import {
  forwardRef,
  type SelectHTMLAttributes,
} from 'react'

import { cn } from '../../shared'
import styles from './Select.module.css'
import { useFieldContext } from '../Field/FieldContext'
import {
  selectVariants,
  type SelectSize,
} from './selectVariants'

export type SelectProps = {
  size?: SelectSize
  invalid?: boolean
  fullWidth?: boolean
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>

function mergeIds(
  first?: string,
  second?: string,
): string | undefined {
  return [first, second].filter(Boolean).join(' ') || undefined
}

export const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(function Select(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    className,
    disabled,
    id,
    required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    children,
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
    <div
      className={cn(
        styles.wrapper,
        fullWidth && styles.wrapperFullWidth,
      )}
    >
      <select
        {...props}
        ref={ref}
        id={resolvedId}
        className={cn(
          selectVariants({
            size,
            invalid: resolvedInvalid,
            fullWidth,
          }),
          className,
        )}
        disabled={disabled}
        required={resolvedRequired}
        aria-describedby={resolvedAriaDescribedBy}
        aria-invalid={resolvedAriaInvalid}
        data-disabled={disabled || undefined}
        data-invalid={resolvedInvalid || undefined}
      >
        {children}
      </select>

      <span
        className={styles.icon}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 20 20"
          focusable="false"
          role="presentation"
        >
          <path
            d="m5 7.5 5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </span>
    </div>
  )
})
