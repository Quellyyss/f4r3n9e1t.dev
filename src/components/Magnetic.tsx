import { useEffect, useRef, type ReactNode } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'

interface Props {
  children: ReactNode
  strength?: number
  className?: string
}

/** Pulls its child slightly toward the pointer while hovered (fine pointers, motion allowed). */
export function Magnetic({ children, strength = 0.28, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !fine || reduced) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const reset = () => {
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', reset)
    }
  }, [fine, reduced, strength])

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', transition: 'transform 600ms cubic-bezier(.2,.7,0,1)' }}
    >
      {children}
    </span>
  )
}
