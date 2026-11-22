import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { TransitionProvider, usePageTransition } from './TransitionProvider'
import { setBoot } from './boot'
import { startRevealObserver } from '../animations/reveal'
import { scrollToTarget, startSmoothScroll, stopSmoothScroll } from '../animations/smoothScroll'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { Cursor } from '../components/Cursor'
import Home from '../pages/Home'

const Project = lazy(() => import('../pages/Project'))
const Viewport = lazy(() => import('../pages/Viewport'))
const NotFound = lazy(() => import('../pages/NotFound'))

/** scroll to top (or to #hash) after every route change; POP keeps the browser's behaviour simple */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])
  useEffect(() => {
    if (pathname !== '/') {
      setBoot('geometry', 'skipped')
      setBoot('shaders', 'skipped')
    }
    const id = hash.slice(1)
    if (!id) {
      scrollToTarget(0, true)
      return
    }
    // lazy sections may need a few frames to exist
    let tries = 0
    let raf = 0
    const seek = () => {
      const el = document.getElementById(id)
      if (el) scrollToTarget(el, type !== 'PUSH')
      else if (tries++ < 30) raf = requestAnimationFrame(seek)
    }
    raf = requestAnimationFrame(seek)
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash, type])
  return null
}

/** easter egg: typing "render" anywhere (outside form fields) opens the viewport */
function SecretKeys() {
  const { go } = usePageTransition()
  useEffect(() => {
    const word = 'render'
    let buffer = ''
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return
      const t = e.target instanceof Element ? e.target : null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
      buffer = (buffer + e.key.toLowerCase()).slice(-word.length)
      if (buffer === word) {
        buffer = ''
        go('/viewport')
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [go])
  return null
}

function Layout() {
  const main = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    startSmoothScroll()
    return stopSmoothScroll
  }, [])

  useEffect(() => startRevealObserver(document.body), [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" ref={main} tabIndex={-1}>
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
          <Outlet />
        </Suspense>
      </main>
      {pathname !== '/viewport' && <Footer />}
      <Cursor />
      <ScrollManager />
      <SecretKeys />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="work/:slug" element={<Project />} />
            <Route path="viewport" element={<Viewport />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  )
}
