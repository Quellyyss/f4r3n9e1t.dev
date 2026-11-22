import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION)
export const useFinePointer = () => useMediaQuery(FINE_POINTER)

export const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches
export const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches
