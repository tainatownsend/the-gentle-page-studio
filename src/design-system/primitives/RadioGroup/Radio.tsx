import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import { useRadioGroupContext } from './RadioGroupContext'
import styles from './RadioGroup.module.css'
import {
  radioControlVariants,
  radioLabelVariants,
} from './radioGroupVariants'

export type RadioProps = {
  value: string
  label: ReactNode
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'defaultChecked' | 'name' | 'size' | 'type' | 'value'
>

export const Radio = forwardRef<
  HTMLInputElement,
  RadioProps
>(function Radio(
  {
    value,
    label,
    id,
    disabled = false,
    className,
    onChange,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const group = useRadioGroupContext()

  const resolvedId = id ?? `radio-${generatedId}`
  const resolvedDisabled = group.disabled || disabled
  const checked = group.value === value

  return (
    <label
      className={cn(
        styles.option,
        resolvedDisabled && styles.disabled,
      )}
      htmlFor={resolvedId}
    >
      <span className={styles.controlWrapper}>
        <input
          {...props}
          ref={ref}
          id={resolvedId}
          type="radio"
          name={group.name}
          value={value}
          checked={checked}
          disabled={resolvedDisabled}
          required={group.required}
          aria-invalid={group.invalid || undefined}
          data-disabled={resolvedDisabled || undefined}
          data-invalid={group.invalid || undefined}
          className={cn(styles.input, className)}
          onChange={(event) => {
            onChange?.(event)

            if (
              !event.defaultPrevented &&
              event.target.checked
            ) {
              group.onValueChange(value)
            }
          }}
        />

        <span
          className={radioControlVariants({
            size: group.size,
            invalid: group.invalid,
          })}
          aria-hidden="true"
        >
          <span className={styles.indicator} />
        </span>
      </span>

      <span
        className={radioLabelVariants({
          size: group.size,
        })}
      >
        {label}

        {group.required && (
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
