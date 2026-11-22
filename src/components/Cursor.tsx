import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import styles from './Cursor.module.css'

/**
 * Dot + ring cursor for fine pointers only.
 * Elements opt into states with data-cursor:
 *   "open" / "play" / any label → ring grows and shows that word
 *   "region" → ring hides (the hero draws its own render-region frame)
 * Links and buttons get the "link" state automatically.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!fine) return
    document.body.classList.add('has-cursor')
    const pos = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    let raf = 0
    let visible = false

    const setState = (target: Element | null) => {
      const host = target?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], input, textarea, select')
      let state = 'default'
      let text = ''
      if (host) {
        const v = host.dataset.cursor
        if (v === 'region') state = 'region'
        else if (v === 'text' || host.matches('input, textarea')) state = 'text'
        else if (v) {
          state = 'label'
          text = v
        } else state = 'link'
      }
      ring.current!.dataset.state = state
      dot.current!.dataset.state = state
      label.current!.textContent = text
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        lag.x = pos.x
        lag.y = pos.y
        dot.current!.style.opacity = '1'
        ring.current!.style.opacity = '1'
      }
    }
    const over = (e: PointerEvent) => setState(e.target as Element)
    const leave = () => {
      visible = false
      dot.current!.style.opacity = '0'
      ring.current!.style.opacity = '0'
    }
    const down = () => ring.current!.classList.add(styles.pressed)
    const up = () => ring.current!.classList.remove(styles.pressed)

    const tick = () => {
      const k = reduced ? 1 : 0.2
      lag.x += (pos.x - lag.x) * k
      lag.y += (pos.y - lag.y) * k
      dot.current!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ring.current!.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [fine, reduced])

  if (!fine) return null
  return (
    <div className={styles.root} aria-hidden="true">
      <div ref={ring} className={styles.ring} data-state="default">
        <span ref={label} className={styles.label} />
      </div>
      <div ref={dot} className={styles.dot} data-state="default" />
    </div>
  )
}
