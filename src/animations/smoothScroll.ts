import Lenis from 'lenis'
import { prefersReducedMotion } from '../hooks/useMediaQuery'

let lenis: Lenis | null = null
let raf = 0

/** Lenis smooth wheel scrolling (desktop). Touch keeps native scrolling; reduced motion disables it. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 })
  const loop = (t: number) => {
    lenis?.raf(t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
}

export function stopSmoothScroll() {
  cancelAnimationFrame(raf)
  lenis?.destroy()
  lenis = null
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

const NAV_OFFSET = -8

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset: typeof target === 'number' ? 0 : NAV_OFFSET, duration: 1.4 })
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + NAV_OFFSET
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}
