import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { TileWipe } from '../animations/tileWipe'
import { scrollToTarget } from '../animations/smoothScroll'
import { prefersReducedMotion } from '../hooks/useMediaQuery'
import { bootComplete, getBoot, onBoot, setBoot, type BootStep } from './boot'
import styles from './TransitionProvider.module.css'

interface Ctx {
  go: (to: string) => void
}

const TransitionContext = createContext<Ctx>({ go: () => {} })
export const usePageTransition = () => useContext(TransitionContext)

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const BOOT_KEY = 'f4r3n9e1t:booted'
const BOOT_TIMEOUT = 3500

function shouldBoot() {
  if (prefersReducedMotion()) return false
  try {
    return !sessionStorage.getItem(BOOT_KEY)
  } catch {
    return true
  }
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wipeRef = useRef<TileWipe | null>(null)
  const busy = useRef(false)
  const [booting, setBooting] = useState(shouldBoot)
  const [, force] = useState(0)

  useLayoutEffect(() => {
    const wipe = new TileWipe(canvasRef.current!)
    wipeRef.current = wipe
    const onResize = () => wipe.layout()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      wipe.destroy()
    }
  }, [])

  // fonts are a real boot step for every page
  useEffect(() => {
    document.fonts?.ready.then(() => setBoot('fonts', 'done'))
  }, [])

  // boot screen: covered until every step is done (or a timeout on slow connections)
  useLayoutEffect(() => {
    if (!booting) return
    const wipe = wipeRef.current!
    wipe.setCovered()
    let finished = false
    const finish = async () => {
      if (finished) return
      finished = true
      try {
        sessionStorage.setItem(BOOT_KEY, '1')
      } catch {
        /* storage blocked — boot again next time, harmless */
      }
      await new Promise((r) => setTimeout(r, 260))
      setBooting(false)
      await wipe.reveal(900)
    }
    const off = onBoot(() => {
      force((n) => n + 1)
      if (bootComplete()) finish()
    })
    if (bootComplete()) finish()
    const timer = setTimeout(finish, BOOT_TIMEOUT)
    return () => {
      off()
      clearTimeout(timer)
    }
  }, [booting])

  const go = useCallback(
    async (to: string) => {
      if (busy.current) return
      const url = new URL(to, window.location.origin)
      const id = url.hash.slice(1)
      if (url.pathname === window.location.pathname) {
        if (id) {
          const el = document.getElementById(id)
          if (el) scrollToTarget(el)
          window.history.replaceState(null, '', url.pathname + url.hash)
        } else scrollToTarget(0)
        return
      }
      if (prefersReducedMotion() || !wipeRef.current) {
        navigate(url.pathname + url.hash)
        return
      }
      busy.current = true
      try {
        await wipeRef.current.cover()
        navigate(url.pathname + url.hash)
        await nextFrame()
        await nextFrame()
        await wipeRef.current.reveal()
      } finally {
        busy.current = false
      }
    },
    [navigate],
  )

  const boot = getBoot()
  const label: Record<BootStep, string> = { fonts: 'Fonts', geometry: 'Geometry', shaders: 'Shaders' }

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <canvas ref={canvasRef} className={styles.wipe} aria-hidden="true" />
      {booting && (
        <div className={styles.boot} role="status" aria-live="polite">
          <p className={styles.bootTitle}>
            Rendering <span>f4r3n9e1t</span>
          </p>
          <ul className={styles.steps}>
            {(Object.keys(label) as BootStep[]).map((k) => (
              <li key={k} data-state={boot[k]}>
                <span>{label[k]}</span>
                <span className={styles.dots} />
                <span>{boot[k] === 'pending' ? '…' : boot[k] === 'done' ? 'ok' : 'skip'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </TransitionContext.Provider>
  )
}
