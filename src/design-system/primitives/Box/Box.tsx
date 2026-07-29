import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
} from 'react'

export type BoxProps<T extends ElementType = 'div'> = {
  as?: T
} & Omit<ComponentPropsWithRef<T>, 'as'>

export function Box<T extends ElementType = 'div'>({
  as,
  ...props
}: BoxProps<T>): ReactElement | null {
  const Component = as ?? 'div'

  return <Component {...props} />
}
