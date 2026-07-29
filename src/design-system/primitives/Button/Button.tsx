import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      startIcon,
      endIcon,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading

    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <span
            className={styles.spinner}
            aria-hidden="true"
            data-testid="button-spinner"
          />
        ) : (
          startIcon && (
            <span className={styles.icon} aria-hidden="true">
              {startIcon}
            </span>
          )
        )}

        <span className={styles.label}>{children}</span>

        {!loading && endIcon && (
          <span className={styles.icon} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    )
  },
)
