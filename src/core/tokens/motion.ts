export const motion = {
  duration: {
    fast: 120,
    normal: 180,
    slow: 260,
  },

  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const

export type MotionToken = typeof motion