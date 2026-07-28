export const lightColors = {
  surface: {
    primary: '#FCFDFC',
    secondary: '#F6F8F7',
    tertiary: '#EEF3F0',
  },

  text: {
    primary: '#1F2522',
    secondary: '#66736C',
    tertiary: '#98A39D',
    inverse: '#FCFDFC',
  },

  border: {
    default: '#E3EAE5',
    subtle: '#F0F3F1',
    strong: '#CCD7D0',
  },

  accent: {
    primary: '#7BA58D',
    hover: '#6D987F',
    active: '#5E836B',
    soft: '#DCEADF',
    contrast: '#FFFFFF',
  },

  feedback: {
    success: '#5E9B73',
    warning: '#D89A3D',
    danger: '#D66B6B',
    info: '#5E8FD6',
  },
} as const

export const darkColors = {
  surface: {
    primary: '#121715',
    secondary: '#1A211D',
    tertiary: '#232C27',
  },

  text: {
    primary: '#F4F7F5',
    secondary: '#C3CEC8',
    tertiary: '#9AA8A0',
    inverse: '#121715',
  },

  border: {
    default: '#2D3933',
    subtle: '#232C27',
    strong: '#415047',
  },

  accent: {
    primary: '#8CB89D',
    hover: '#9CC6AC',
    active: '#79A98B',
    soft: '#24352C',
    contrast: '#FFFFFF',
  },

  feedback: {
    success: '#6DB884',
    warning: '#E6B255',
    danger: '#E07D7D',
    info: '#7AA8EA',
  },
} as const

export type ColorTheme = typeof lightColors

export const colors = lightColors