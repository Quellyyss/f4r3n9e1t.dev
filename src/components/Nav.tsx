import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../config/site.config'
import { lockScroll } from '../animations/smoothScroll'
import { TransitionLink } from './TransitionLink'
import { Magnetic } from './Magnetic'
import styles from './Nav.module.css'

export const SECTIONS = [
  { id: 'work', label: 'Portfolio' },
  { id: 'toolset', label: 'Toolset' },
  { id: 'contact', label: 'Contact' },
] as const

export function Nav() {
  const { pathname } = useLocation()
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // highlight the section currently in view (home only)
  useEffect(() => {
    setActive(null)
    if (pathname !== '/') return
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  // menu overlay: lock scroll, Esc closes, focus moves in and back
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    menuRef.current?.querySelector<HTMLElement>('a')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && menuRef.current) {
        const f = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a, button'))
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      lockScroll(false)
      toggleRef.current?.focus()
    }
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={styles.nav} data-menu={open || undefined}>
      <TransitionLink to="/" className={styles.logo} aria-label={`${site.brand.nick} — home`}>
        <span className={styles.mark} aria-hidden="true" />
        {site.brand.nick}
      </TransitionLink>

      <nav aria-label="Sections" className={styles.links}>
        {SECTIONS.map((s, i) => (
          <Magnetic key={s.id} strength={0.2}>
            <TransitionLink
              to={`/#${s.id}`}
              className={styles.link}
              aria-current={active === s.id ? 'true' : undefined}
            >
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </TransitionLink>
          </Magnetic>
        ))}
      </nav>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <div id="menu" ref={menuRef} className={styles.menu} data-open={open || undefined} hidden={!open}>
        <ol className={styles.menuList}>
          {SECTIONS.map((s, i) => (
            <li key={s.id} style={{ transitionDelay: `${80 + i * 60}ms` }}>
              <TransitionLink to={`/#${s.id}`} onClick={() => setOpen(false)}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </TransitionLink>
            </li>
          ))}
        </ol>
        <p className="meta">{site.brand.role}</p>
      </div>
    </header>
  )
}
