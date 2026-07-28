import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

function ThemeConsumer() {
  const { mode, toggleMode } = useTheme()

  return (
    <>
      <span>{mode}</span>
      <button type="button" onClick={toggleMode}>
        Toggle theme
      </button>
    </>
  )
}

describe('ThemeProvider', () => {
  it('uses the default theme mode', () => {
    render(
      <ThemeProvider defaultMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('toggles between light and dark modes', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByText('light')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle theme',
      }),
    )

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('applies theme CSS variables to the document root', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(
      document.documentElement.style.getPropertyValue(
        '--color-surface-primary',
      ),
    ).not.toBe('')
  })
})