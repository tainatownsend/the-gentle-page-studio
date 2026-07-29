import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import { getThemeVariables, type ThemeMode } from './theme'

type ThemeProviderProps = {
  children: ReactNode
  defaultMode?: ThemeMode
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode)

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
      toggleMode: () => {
        setMode((currentMode) =>
          currentMode === 'light' ? 'dark' : 'light',
        )
      },
    }),
    [mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}