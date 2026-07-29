import {
  darkCssVariables,
  lightCssVariables,
  sharedCssVariables,
} from './cssVariables'

export type ThemeMode = 'light' | 'dark'

export const themes = {
  light: {
    ...sharedCssVariables,
    ...lightCssVariables,
  },
  dark: {
    ...sharedCssVariables,
    ...darkCssVariables,
  },
} as const

export type ThemeVariables = (typeof themes)[ThemeMode]

export function getThemeVariables(mode: ThemeMode): ThemeVariables {
  return themes[mode]
}