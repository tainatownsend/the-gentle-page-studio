import {
  forwardRef,
  type TextareaHTMLAttributes,
} from 'react'

import { cn } from '../../shared'
import { useFieldContext } from '../Field/FieldContext'
import {
  textareaVariants,
  type TextareaResize,
  type TextareaSize,
} from './textareaVariants'

export type TextareaProps = {
  size?: TextareaSize
  invalid?: boolean
  fullWidth?: boolean
  resize?: TextareaResize
} & TextareaHTMLAttributes<HTMLTextAreaElement>

function mergeIds(
  first?: string,
  second?: string,
): string | undefined {
  return [first, second].filter(Boolean).join(' ') || undefined
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
  {
    size = 'md',
    invalid,
    fullWidth = false,
    resize = 'vertical',
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
    <textarea
      {...props}
      ref={ref}
      id={resolvedId}
      className={cn(
        textareaVariants({
          size,
          invalid: resolvedInvalid,
          fullWidth,
          resize,
        }),
        className,
      )}
      disabled={disabled}
      required={resolvedRequired}
      aria-describedby={resolvedAriaDescribedBy}
      aria-invalid={resolvedAriaInvalid}
      data-disabled={disabled || undefined}
      data-invalid={resolvedInvalid || undefined}
    />
  )
})
