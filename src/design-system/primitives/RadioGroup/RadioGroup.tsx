import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import { useFieldContext } from '../Field/FieldContext'
import { RadioGroupContext } from './RadioGroupContext'
import { radioGroupVariants } from './radioGroupVariants'
import type {
  RadioGroupOrientation,
  RadioGroupSize,
} from './radioGroupVariants'

export type RadioGroupProps = {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  size?: RadioGroupSize
  orientation?: RadioGroupOrientation
  fullWidth?: boolean
} & Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
>

function mergeIds(
  first?: string,
  second?: string,
): string | undefined {
  return [first, second].filter(Boolean).join(' ') || undefined
}

export const RadioGroup = forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(function RadioGroup(
  {
    children,
    value,
    defaultValue,
    onValueChange,
    name,
    disabled = false,
    invalid,
    required,
    size = 'md',
    orientation = 'vertical',
    fullWidth = false,
    className,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedName = useId()
  const fieldContext = useFieldContext()
  const [internalValue, setInternalValue] = useState(
    defaultValue,
  )

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue
  const resolvedName = name ?? `radio-group-${generatedName}`
  const resolvedId = id ?? fieldContext?.controlId
  const resolvedInvalid =
    invalid ?? fieldContext?.invalid ?? false
  const resolvedRequired =
    required ?? fieldContext?.required ?? false

  const resolvedAriaDescribedBy = mergeIds(
    ariaDescribedBy,
    fieldContext?.describedBy,
  )

  const resolvedAriaInvalid =
    ariaInvalid ?? (resolvedInvalid || undefined)

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (disabled) {
        return
      }

      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onValueChange?.(nextValue)
    },
    [disabled, isControlled, onValueChange],
  )

  const contextValue = useMemo(
    () => ({
      name: resolvedName,
      value: resolvedValue,
      disabled,
      invalid: resolvedInvalid,
      required: resolvedRequired,
      size,
      onValueChange: handleValueChange,
    }),
    [
      resolvedName,
      resolvedValue,
      disabled,
      resolvedInvalid,
      resolvedRequired,
      size,
      handleValueChange,
    ],
  )

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        {...props}
        ref={ref}
        id={resolvedId}
        role="radiogroup"
        aria-describedby={resolvedAriaDescribedBy}
        aria-invalid={resolvedAriaInvalid}
        aria-required={resolvedRequired || undefined}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-invalid={resolvedInvalid || undefined}
        data-orientation={orientation}
        className={cn(
          radioGroupVariants({
            orientation,
            fullWidth,
          }),
          className,
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})
