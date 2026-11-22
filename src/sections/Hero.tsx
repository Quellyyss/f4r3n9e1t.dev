import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { site } from '../config/site.config'
import { setBoot } from '../app/boot'
import { hasWebGL } from '../three/webgl'
import type { Sculpture } from '../three/sculpture'
import { hasFinePointer, prefersReducedMotion, useFinePointer } from '../hooks/useMediaQuery'
import { NeonSignature } from '../components/NeonSignature'
import { Magnetic } from '../components/Magnetic'
import { TransitionLink } from '../components/TransitionLink'
import styles from './Hero.module.css'

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function Word({ lines, refs }: { lines: string[]; refs?: RefObject<HTMLSpanElement[]> }) {
  let n = 0
  return (
    <>
      {lines.map((line) => (
        <span className={styles.line} key={line}>
          {line.split('').map((ch) => {
            const i = n++
            return (
              <span
                key={i}
                className={styles.letter}
                ref={(el) => {
                  if (refs?.current && el) refs.current[i] = el
                }}
              >
                {ch}
              </span>
            )
          })}
        </span>
      ))}
    </>
  )
}

const works = site.projects.filter((p) => p.status === 'published').length
const latestYear = Math.max(...site.projects.map((p) => p.year))

export function Hero() {
  const fine = useFinePointer()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLHeadingElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const outlineLetters = useRef<HTMLSpanElement[]>([])
  const fillLetters = useRef<HTMLSpanElement[]>([])
  const [webgl] = useState(hasWebGL)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 600)
  const lines = narrow ? [site.brand.nick.slice(0, 5), site.brand.nick.slice(5)] : [site.brand.nick]

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ── the WebGL stone (lazy chunk) ─────────────────────── */
  const sculptureRef = useRef<Sculpture | null>(null)
  useEffect(() => {
    if (!webgl) {
      setBoot('geometry', 'skipped')
      setBoot('shaders', 'skipped')
      return
    }
    let cancelled = false
    let instance: Sculpture | null = null
    const lowEnd =
      !hasFinePointer() || Math.min(window.screen.width, window.screen.height) < 700 || (navigator.hardwareConcurrency ?? 8) <= 4
    import('../three/sculpture')
      .then(({ createSculpture }) => {
        if (cancelled || !hostRef.current) return
        instance = createSculpture(hostRef.current, {
          quality: lowEnd ? 'low' : 'high',
          reducedMotion: prefersReducedMotion(),
          onStep: (s) => setBoot(s, 'done'),
        })
        sculptureRef.current = instance
        hostRef.current.dataset.ready = ''
      })
      .catch(() => {
        setBoot('geometry', 'skipped')
        setBoot('shaders', 'skipped')
      })
    return () => {
      cancelled = true
      instance?.dispose()
      sculptureRef.current = null
    }
  }, [webgl])

  /* ── region, type fill, letter width, scroll progress ── */
  useEffect(() => {
    const stage = stageRef.current!
    const section = sectionRef.current!
    const region = regionRef.current!
    const fill = fillRef.current!
    const word = wordRef.current!
    const reduced = prefersReducedMotion()

    let W = 0, H = 0
    let wordBox = { l: 0, t: 0, r: 0, b: 0 }
    let letterCenters: number[] = []
    let letterWidth = 1
    let lastStretchKey = ''

    const fit = () => {
      W = stage.clientWidth
      H = stage.clientHeight
      // measure at the base (condensed) width defined in CSS
      ;[...outlineLetters.current, ...fillLetters.current].forEach((el) => el && (el.style.fontStretch = ''))
      lastStretchKey = ''
      // fit the widest line to ~90% of the stage at the base (condensed) width
      word.style.setProperty('--fs', '100px')
      const widest = Math.max(...Array.from(word.querySelectorAll<HTMLElement>(`.${styles.outline} .${styles.line}`)).map((l) => l.scrollWidth))
      if (widest > 0) word.style.setProperty('--fs', `${Math.floor((100 * W * (W < 600 ? 0.84 : 0.9)) / widest)}px`)
      measure()
    }
    const measure = () => {
      const s = stage.getBoundingClientRect()
      const w = word.getBoundingClientRect()
      wordBox = { l: w.left - s.left, t: w.top - s.top, r: w.right - s.left, b: w.bottom - s.top }
      letterCenters = outlineLetters.current.map((el) => {
        const r = el.getBoundingClientRect()
        return r.left - s.left + r.width / 2
      })
      letterWidth = Math.max(1, (outlineLetters.current[0]?.getBoundingClientRect().width ?? 1))
    }

    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    document.fonts?.ready.then(fit)
    fit()

    // pointer
    const target = { x: W / 2, y: H / 2 }
    const cur = { x: W / 2, y: H / 2 }
    let pointerInside = false
    let tapHoldUntil = 0
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
      if (e.pointerType === 'mouse') pointerInside = true
      else tapHoldUntil = performance.now() + 3500
      sculptureRef.current?.setPointer((target.x / W) * 2 - 1, -((target.y / H) * 2 - 1))
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pointerInside = false
    }
    stage.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerdown', onMove, { passive: true })
    stage.addEventListener('pointerleave', onLeave)

    // pause the stone when the hero is off screen or the tab is hidden
    let onScreen = true
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      sculptureRef.current?.setPaused(!onScreen || document.hidden)
    })
    io.observe(section)
    const onVis = () => sculptureRef.current?.setPaused(!onScreen || document.hidden)
    document.addEventListener('visibilitychange', onVis)

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!onScreen) return
      const t = (now - t0) / 1000

      // scroll progress through the hero runway
      const runway = Math.max(1, section.offsetHeight - H)
      const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / runway))
      const expand = smoothstep(0.04, 0.62, p)

      // where the region wants to be
      if (!pointerInside && now > tapHoldUntil) {
        if (reduced) {
          target.x = W / 2
          target.y = H / 2
        } else {
          target.x = W / 2 + Math.sin(t * 0.37) * W * 0.2
          target.y = H / 2 + Math.sin(t * 0.53 + 1) * H * 0.12
        }
      }
      const k = reduced ? 1 : 0.12
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k

      const rw = W < 600 ? W * 0.64 : Math.min(Math.max(W * 0.28, 240), 460)
      const rh = rw * 0.66
      // keep the whole frame on screen
      const cx = Math.min(W - rw / 2 - 8, Math.max(rw / 2 + 8, cur.x))
      const cy = Math.min(H - rh / 2 - 8, Math.max(rh / 2 + 8, cur.y))
      let x0 = cx - rw / 2, y0 = cy - rh / 2, x1 = cx + rw / 2, y1 = cy + rh / 2
      x0 += (0 - x0) * expand
      y0 += (0 - y0) * expand
      x1 += (W - x1) * expand
      y1 += (H - y1) * expand

      region.style.transform = `translate3d(${x0}px, ${y0}px, 0)`
      region.style.width = `${x1 - x0}px`
      region.style.height = `${y1 - y0}px`
      region.style.opacity = String(1 - smoothstep(0.45, 0.62, p))

      // solid letters only inside the region
      const it = Math.max(0, y0 - wordBox.t)
      const ir = Math.max(0, wordBox.r - x1)
      const ib = Math.max(0, wordBox.b - y1)
      const il = Math.max(0, x0 - wordBox.l)
      fill.style.clipPath = `inset(${it}px ${ir}px ${ib}px ${il}px)`

      sculptureRef.current?.setRegion(x0, y0, x1, y1)
      sculptureRef.current?.setOpen(expand)
      stage.style.setProperty('--p', p.toFixed(3))

      // letters near the region centre widen — the region "renders" the type wider
      if (!reduced && letterCenters.length) {
        const cx = (x0 + x1) / 2
        const stretches = letterCenters.map((c) => {
          const d = (c - cx) / (letterWidth * 1.6)
          return Math.round(78 + (1 - expand) * 26 * Math.exp(-d * d) + expand * 4)
        })
        const key = stretches.join(',')
        if (key !== lastStretchKey) {
          lastStretchKey = key
          stretches.forEach((s, i) => {
            const v = `${s}%`
            outlineLetters.current[i].style.fontStretch = v
            if (fillLetters.current[i]) fillLetters.current[i].style.fontStretch = v
          })
        }
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerdown', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [narrow])

  return (
    <section id="top" ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <div ref={stageRef} className={styles.stage} data-cursor="region">
        <h1 id="hero-title" ref={wordRef} className={styles.word}>
          <span className="visually-hidden">
            {site.brand.nick} — 3D Portfolio. {site.brand.role}
          </span>
          <span className={styles.outline} aria-hidden="true">
            <Word lines={lines} refs={outlineLetters} />
          </span>
          <span ref={fillRef} className={styles.fill} aria-hidden="true">
            <Word lines={lines} refs={fillLetters} />
          </span>
        </h1>

        <div ref={hostRef} className={styles.host}>
          {!webgl && (
            <svg className={styles.fallback} viewBox="0 0 200 240" aria-hidden="true">
              <path d="M100 8 L156 38 L176 104 L160 176 L112 230 L54 214 L22 150 L28 72 Z" />
              <path d="M28 72 L100 8 M28 72 L96 96 L156 38 M96 96 L176 104 M22 150 L96 96 L160 176 M96 96 L112 230 M54 214 L96 96" />
              <path className={styles.seam} d="M24 118 L70 104 L104 116 L140 98 L174 110" />
            </svg>
          )}
        </div>

        <div ref={regionRef} className={styles.region} aria-hidden="true">
          <span>Render region</span>
        </div>

        <div className={styles.top}>
          <div className={styles.kicker} data-reveal="">
            <p className={styles.plate}>
              <span className={styles.plateTag}>3D</span>Portfolio
            </p>
            <p className="meta">
              {site.brand.role} · {String(works).padStart(2, '0')} works · {latestYear}
            </p>
          </div>
          <ol className={`meta ${styles.cats}`} data-reveal="" style={{ '--delay': '120ms' } as CSSProperties}>
            {site.categories.map((c) => (
              <li key={c.id}>
                <span>{c.index}</span> {c.label}
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.bottom}>
          <p className={styles.statement} data-reveal="" style={{ '--delay': '200ms' } as CSSProperties}>
            {site.hero.statement}
          </p>
          <NeonSignature size="md" className={styles.neon} />
          <div className={styles.hint} data-reveal="" style={{ '--delay': '320ms' } as CSSProperties}>
            <Magnetic>
              <TransitionLink to="/#work" className={styles.cta} data-cursor="Open">
                View portfolio <span aria-hidden="true">↓</span>
              </TransitionLink>
            </Magnetic>
            <span className="meta">{fine ? 'Move the cursor' : 'Tap the stone'} — render region</span>
          </div>
        </div>
      </div>
    </section>
  )
}
