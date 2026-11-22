import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site.config'
import { hasWebGL } from '../three/webgl'
import type { Sculpture, ShadeMode } from '../three/sculpture'
import { prefersReducedMotion } from '../hooks/useMediaQuery'
import { TransitionLink } from '../components/TransitionLink'
import styles from './Viewport.module.css'

/**
 * Secret page (type "render" anywhere): the hero stone in a bare viewport.
 * Keys 1–4 switch the shading like Blender's Z pie; drag to orbit.
 */
const MODES: { id: ShadeMode; key: string; label: string }[] = [
  { id: 'wire', key: '1', label: 'Wireframe' },
  { id: 'clay', key: '2', label: 'Clay' },
  { id: 'rendered', key: '3', label: 'Rendered' },
  { id: 'region', key: '4', label: 'Region' },
]

export default function Viewport() {
  const host = useRef<HTMLDivElement>(null)
  const sculpture = useRef<Sculpture | null>(null)
  const [mode, setMode] = useState<ShadeMode>('rendered')
  const [webgl] = useState(hasWebGL)

  useEffect(() => {
    document.title = `Viewport — ${site.brand.signature} ${site.brand.nick}`
    return () => {
      document.title = site.brand.siteTitle
    }
  }, [])

  useEffect(() => {
    if (!webgl) return
    let cancelled = false
    let s: Sculpture | null = null
    import('../three/sculpture').then(({ createSculpture }) => {
      if (cancelled || !host.current) return
      s = createSculpture(host.current, { quality: 'high', reducedMotion: prefersReducedMotion() })
      s.setMode('rendered')
      s.setOpen(0.35)
      sculpture.current = s
    })
    return () => {
      cancelled = true
      s?.dispose()
      sculpture.current = null
    }
  }, [webgl])

  useEffect(() => {
    sculpture.current?.setMode(mode)
  }, [mode])

  // 1–4 switch modes (ignored while typing in a field or with modifiers)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target instanceof Element ? e.target : null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
      const m = MODES.find((x) => x.key === e.key)
      if (m) setMode(m.id)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  // drag to orbit; in "region" mode the region follows the pointer
  useEffect(() => {
    const el = host.current
    if (!el) return
    let last: { x: number; y: number } | null = null
    const down = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      sculpture.current?.setRegion(x - 180, y - 120, x + 180, y + 120)
      if (!last) return
      sculpture.current?.orbit((e.clientX - last.x) * 0.008, (e.clientY - last.y) * 0.006)
      last = { x: e.clientX, y: e.clientY }
    }
    const up = () => {
      last = null
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <section className={styles.page} aria-labelledby="vp-title">
      <div ref={host} className={styles.host} data-cursor="Orbit" />
      <div className={styles.ui}>
        <div className={styles.top}>
          <h1 id="vp-title" className="meta">
            Viewport · the stone from the first screen
          </h1>
          <TransitionLink to="/" className={`meta ${styles.exit}`}>
            Exit viewport ×
          </TransitionLink>
        </div>
        {webgl ? (
          <div className={styles.modes} role="radiogroup" aria-label="Viewport shading">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                <span className={styles.key}>{m.key}</span> {m.label}
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.nogl}>This browser can’t start WebGL, so the viewport stays dark.</p>
        )}
        <p className={`meta ${styles.hint}`}>Drag to orbit · keys 1–4 switch shading</p>
      </div>
    </section>
  )
}
