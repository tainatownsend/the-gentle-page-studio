import { createContext, useContext } from 'react'

export type FieldContextValue = {
  controlId: string
  describedBy?: string
  invalid: boolean
  required: boolean
}

export const FieldContext =
  createContext<FieldContextValue | null>(null)

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext)
}
