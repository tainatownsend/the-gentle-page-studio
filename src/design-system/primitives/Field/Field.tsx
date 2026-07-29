import {
  useId,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '../../shared'
import styles from './Field.module.css'
import {
  FieldContext,
  type FieldContextValue,
} from './FieldContext'

export type FieldProps = {
  children: ReactNode
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  required?: boolean
  optionalText?: ReactNode
  controlId?: string
  renderLabel?: boolean
  labelClassName?: string
  contentClassName?: string
} & HTMLAttributes<HTMLDivElement>

function createFieldId(generatedId: string): string {
  return `field-${generatedId.replaceAll(':', '')}`
}

export function Field({
  children,
  label,
  description,
  error,
  required = false,
  optionalText = 'Optional',
  controlId,
  renderLabel = true,
  className,
  labelClassName,
  contentClassName,
  ...props
}: FieldProps) {
  const generatedId = useId()
  const baseId = controlId ?? createFieldId(generatedId)

  const descriptionId = description
    ? `${baseId}-description`
    : undefined

  const errorId = error ? `${baseId}-error` : undefined

  const describedBy = [descriptionId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  const contextValue: FieldContextValue = {
    controlId: baseId,
    describedBy,
    invalid: Boolean(error),
    required,
    hasExternalLabel: renderLabel,
  }

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        {...props}
        className={cn(styles.field, className)}
        data-invalid={error ? true : undefined}
      >
        {renderLabel && (
          <div className={styles.heading}>
            <label
              htmlFor={baseId}
              className={cn(styles.label, labelClassName)}
            >
              {label}

              {required && (
                <>
                  <span
                    className={styles.requiredIndicator}
                    aria-hidden="true"
                  >
                    *
                  </span>

                  <span className={styles.visuallyHidden}>
                    Required
                  </span>
                </>
              )}
            </label>

            {!required && optionalText && (
              <span className={styles.optional}>
                {optionalText}
              </span>
            )}
          </div>
        )}

        <div className={cn(styles.content, contentClassName)}>
          {children}
        </div>

        {description && (
          <div
            id={descriptionId}
            className={styles.description}
          >
            {description}
          </div>
        )}

        {error && (
          <div
            id={errorId}
            className={styles.error}
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </FieldContext.Provider>
  )
}
