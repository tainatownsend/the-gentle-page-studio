import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

type MatchMediaController = {
  setMatches: (matches: boolean) => void
}

function installMatchMedia(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      media: query,
      get matches() {
        return matches
      },
      onchange: null,
      addEventListener: (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') {
          listeners.add(listener)
        }
      },
      removeEventListener: (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === 'change') {
          listeners.delete(listener)
        }
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches

      const event = {
        matches,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryListEvent

      for (const listener of listeners) {
        listener(event)
      }
    },
  }
}

function ThemeConsumer() {
  const { mode, setMode, toggleMode } = useTheme()

  return (
    <>
      <span>{mode}</span>

      <button type="button" onClick={toggleMode}>
        Toggle theme
      </button>

      <button type="button" onClick={() => setMode('light')}>
        Use light theme
      </button>
    </>
  )
}

afterEach(() => {
  vi.unstubAllGlobals()

  const root = document.documentElement
  delete root.dataset.theme
  root.style.removeProperty('color-scheme')
})

describe('ThemeProvider', () => {
  it('uses an explicit default theme mode', () => {
    installMatchMedia(false)

    render(
      <ThemeProvider defaultMode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('uses the current system preference by default', () => {
    installMatchMedia(true)

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('follows system preference changes', () => {
    const matchMedia = installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByText('light')).toBeInTheDocument()

    act(() => {
      matchMedia.setMatches(true)
    })

    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('stops following the system after an explicit choice', () => {
    const matchMedia = installMatchMedia(true)

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Use light theme',
      }),
    )

    expect(screen.getByText('light')).toBeInTheDocument()

    act(() => {
      matchMedia.setMatches(false)
      matchMedia.setMatches(true)
    })

    expect(screen.getByText('light')).toBeInTheDocument()
  })

  it('toggles between light and dark modes', () => {
    installMatchMedia(false)

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
    installMatchMedia(false)

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(document.documentElement.style.getPropertyValue('--color-surface-primary')).not.toBe('')
  })
})
