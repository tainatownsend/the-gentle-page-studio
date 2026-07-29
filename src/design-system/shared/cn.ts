import { clsx, type ClassValue } from 'clsx'

/**
 * Combines conditional class names into a single string.
 *
 * Supports strings, arrays, objects and falsy values through clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
