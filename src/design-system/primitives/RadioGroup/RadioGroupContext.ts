import { createContext, useContext } from 'react'

import type { RadioGroupSize } from './radioGroupVariants'

export type RadioGroupContextValue = {
  name: string
  value?: string
  disabled: boolean
  invalid: boolean
  required: boolean
  size: RadioGroupSize
  onValueChange: (value: string) => void
}

const RadioGroupContext =
  createContext<RadioGroupContextValue | null>(null)

export function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext)

  if (!context) {
    throw new Error(
      'Radio must be rendered inside a RadioGroup.',
    )
  }

  return context
}

export { RadioGroupContext }
