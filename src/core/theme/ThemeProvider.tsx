import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import { getThemeVariables, type ThemeMode } from './theme'

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

type ThemeProviderProps = {
  children: ReactNode
  defaultMode?: ThemeMode
}

function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children, defaultMode }: ThemeProviderProps) {
  const followsSystemPreference = useRef(defaultMode === undefined)
  const [mode, setModeState] = useState<ThemeMode>(() => defaultMode ?? getSystemThemeMode())

  const setMode = useCallback((nextMode: ThemeMode) => {
    followsSystemPreference.current = false
    setModeState(nextMode)
  }, [])

  const toggleMode = useCallback(() => {
    followsSystemPreference.current = false
    setModeState((currentMode) => (currentMode === 'light' ? 'dark' : 'light'))
  }, [])

  useEffect(() => {
    if (defaultMode !== undefined || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY)

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      if (!followsSystemPreference.current) {
        return
      }

      setModeState(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [defaultMode])

  useEffect(() => {
    const root = document.documentElement
    const variables = getThemeVariables(mode)

    root.dataset.theme = mode
    root.style.colorScheme = mode

    for (const [property, value] of Object.entries(variables)) {
      root.style.setProperty(property, value)
    }
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
