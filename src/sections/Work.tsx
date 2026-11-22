import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { site } from '../config/site.config'
import type { CategoryId, Project } from '../config/types'
import { useFinePointer, useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import { BucketImage } from '../components/BucketImage'
import { SectionHead } from '../components/SectionHead'
import { RevealText } from '../components/RevealText'
import { TransitionLink } from '../components/TransitionLink'
import styles from './Work.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

type SortKey = 'newest' | 'oldest' | 'az' | 'category'
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A–Z' },
  { id: 'category', label: 'Category' },
]
/** projects without an exact date sort by their year only */
const dateKey = (p: Project) => p.date ?? `${p.year}-00-00`

function sortProjects(list: Project[], key: SortKey) {
  const order = new Map(site.projects.map((p, i) => [p.slug, i]))
  const catIndex = (p: Project) => site.categories.findIndex((c) => c.id === p.category)
  const tie = (a: Project, b: Project) => order.get(a.slug)! - order.get(b.slug)!
  // demo slots are placeholders — always after the real work
  const demo = (p: Project) => (p.status === 'demo' ? 1 : 0)
  return [...list].sort((a, b) => {
    if (demo(a) !== demo(b)) return demo(a) - demo(b)
    switch (key) {
      case 'newest':
        return dateKey(b).localeCompare(dateKey(a)) || tie(a, b)
      case 'oldest':
        return dateKey(a).localeCompare(dateKey(b)) || tie(a, b)
      case 'az':
        return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }) || tie(a, b)
      case 'category':
        return catIndex(a) - catIndex(b) || dateKey(b).localeCompare(dateKey(a)) || tie(a, b)
    }
  })
}
const categoryOf = (id: CategoryId) => site.categories.find((c) => c.id === id)!

function Caption({ project, n, total }: { project: Project; n: number; total: number }) {
  const cat = categoryOf(project.category)
  return (
    <div className={styles.caption}>
      <span className="meta">
        {pad(n)} / {pad(total)}
      </span>
      <h3 className={styles.title}>{project.title}</h3>
      <span className="meta">
        {cat.index} {cat.label} · {project.year}
        {project.status === 'demo' && <span className={styles.demo}>Demo slot</span>}
      </span>
    </div>
  )
}

/* ── pinned horizontal reel (desktop) ─────────────────── */
function Reel({ projects }: { projects: Project[] }) {
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const t = track.current!
    // never shorter than the viewport, even when a filter leaves one frame
    const measure = () => setHeight(Math.max(0, t.scrollWidth - window.innerWidth) + window.innerHeight)
    const ro = new ResizeObserver(measure)
    ro.observe(t)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [projects])

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const o = outer.current
      const t = track.current
      if (!o || !t) return
      const r = o.getBoundingClientRect()
      const run = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / run))
      t.style.transform = `translate3d(${-p * Math.max(0, t.scrollWidth - window.innerWidth)}px, 0, 0)`
      o.style.setProperty('--reel', p.toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [height])

  return (
    <div ref={outer} className={styles.reelOuter} style={{ height }}>
      <div className={styles.reelSticky}>
        <div
          ref={track}
          className={styles.track}
          onFocus={(e) => {
            // keyboard users: bring the focused frame into the pinned view
            const o = outer.current
            const t = track.current
            const item = (e.target as HTMLElement).closest<HTMLElement>('a')
            // only for keyboard focus — a mouse click must not move the frame under the pointer
            if (!o || !t || !item || !item.matches(':focus-visible')) return
            const span = Math.max(0, t.scrollWidth - window.innerWidth)
            const p = Math.min(1, Math.max(0, (item.offsetLeft - window.innerWidth * 0.2) / Math.max(1, span)))
            const top = o.getBoundingClientRect().top + window.scrollY
            window.scrollTo({ top: top + p * (o.offsetHeight - window.innerHeight) })
          }}
        >
          {projects.map((p, i) => (
            <TransitionLink
              key={p.slug}
              to={`/work/${p.slug}`}
              className={styles.frame}
              data-cursor="Open"
              style={{ '--ratio': p.cover.width / p.cover.height } as CSSProperties}
            >
              <div className={styles.media}>
                <BucketImage media={p.cover} sizes={`${Math.ceil((58 * p.cover.width) / p.cover.height)}vh`} fill />
                <span className={styles.crop} aria-hidden="true" />
              </div>
              <Caption project={p} n={i + 1} total={projects.length} />
            </TransitionLink>
          ))}
          <div className={styles.endCard}>
            <span className="meta">End of queue</span>
            <p className={styles.endText}>
              {pad(projects.length)} {projects.length === 1 ? 'piece' : 'pieces'} rendered.
            </p>
            <TransitionLink to="/#contact" className={styles.endLink}>
              Start a project →
            </TransitionLink>
          </div>
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  )
}

/* ── vertical stack (phones, tablets, reduced motion) ── */
function Stack({ projects }: { projects: Project[] }) {
  return (
    <ol className={styles.stack}>
      {projects.map((p, i) => (
        <li key={p.slug} className={styles.stackItem} data-shape={p.cover.width > p.cover.height * 1.15 ? 'wide' : 'tall'}>
          <TransitionLink to={`/work/${p.slug}`} className={styles.stackLink} data-cursor="Open">
            <BucketImage media={p.cover} sizes={p.cover.width > p.cover.height * 1.15 ? '100vw' : '84vw'} />
            <Caption project={p} n={i + 1} total={projects.length} />
          </TransitionLink>
        </li>
      ))}
    </ol>
  )
}

/* ── typographic index with a preview that follows the cursor ── */
function Index({ projects }: { projects: Project[] }) {
  const fine = useFinePointer()
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<Project | null>(null)

  useEffect(() => {
    if (!fine) return
    const el = preview.current!
    const pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
    }
    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.16
      cur.y += (pos.y - cur.y) * 0.16
      el.style.transform = `translate3d(${cur.x + 28}px, ${cur.y - 90}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [fine])

  return (
    <div className={styles.index} onPointerLeave={() => setHover(null)}>
      <ol>
        {projects.map((p, i) => {
          const cat = categoryOf(p.category)
          return (
            <li key={p.slug} data-reveal="" style={{ '--delay': `${i * 50}ms` } as CSSProperties}>
              <TransitionLink
                to={`/work/${p.slug}`}
                className={styles.row}
                data-cursor="Open"
                onPointerEnter={() => setHover(p)}
                onFocus={() => setHover(null)}
              >
                <span className={`meta ${styles.rowNum}`}>{pad(i + 1)}</span>
                <span className={styles.rowTitle}>{p.title}</span>
                <span className={`meta ${styles.rowCat}`}>
                  {cat.index} {cat.label}
                  {p.status === 'demo' && <span className={styles.demo}>Demo slot</span>}
                </span>
                <span className={`meta ${styles.rowYear}`}>{p.year}</span>
                <img className={styles.rowThumb} src={p.cover.srcSmall ?? p.cover.src} alt="" loading="lazy" />
              </TransitionLink>
            </li>
          )
        })}
      </ol>
      {fine && (
        <div ref={preview} className={styles.preview} data-visible={hover ? '' : undefined} aria-hidden="true">
          {projects.map((p) => (
            <img
              key={p.slug}
              src={p.cover.srcSmall ?? p.cover.src}
              alt=""
              loading="lazy"
              data-active={hover?.slug === p.slug ? '' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Work() {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [view, setView] = useState<'reel' | 'index'>('reel')
  const [sort, setSort] = useState<SortKey>('newest')
  const wide = useMediaQuery('(min-width: 900px)')
  const reduced = useReducedMotion()
  const projects = useMemo(
    () => sortProjects(filter === 'all' ? site.projects : site.projects.filter((p) => p.category === filter), sort),
    [filter, sort],
  )
  const count = (id: CategoryId) => site.projects.filter((p) => p.category === id).length
  const published = site.projects.filter((p) => p.status === 'published').length

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          index="01"
          title="Portfolio"
          aside={`${pad(published)} works · ${pad(site.categories.length)} categories`}
        />
        <div className={styles.head}>
          <RevealText as="h2" id="work-title" text="Portfolio." className={styles.h2} />
          <div className={styles.controls}>
            <div className={styles.filters} role="group" aria-label="Filter by category">
              <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                All <sup>{site.projects.length}</sup>
              </button>
              {site.categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  aria-pressed={filter === c.id}
                  disabled={count(c.id) === 0}
                  onClick={() => setFilter(c.id)}
                >
                  <span className={styles.fIndex}>{c.index}</span> {c.label} <sup>{count(c.id)}</sup>
                </button>
              ))}
            </div>
            <div className={styles.row2}>
            <div className={styles.views} role="group" aria-label="Sort works">
              <span className={styles.groupLabel} aria-hidden="true">
                Sort
              </span>
              {SORTS.map((s) => (
                <button type="button" key={s.id} aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className={styles.views} role="group" aria-label="Layout">
              <span className={styles.groupLabel} aria-hidden="true">
                View
              </span>
              <button type="button" aria-pressed={view === 'reel'} onClick={() => setView('reel')}>
                Reel
              </button>
              <button type="button" aria-pressed={view === 'index'} onClick={() => setView('index')}>
                Index
              </button>
            </div>
            </div>
          </div>
          {filter !== 'all' && <p className={styles.blurb}>{categoryOf(filter).blurb}</p>}
        </div>
      </div>

      {view === 'index' ? (
        <div className="wrap">
          <Index projects={projects} />
        </div>
      ) : wide && !reduced ? (
        <Reel key={`${filter}-${sort}`} projects={projects} />
      ) : (
        <div className="wrap">
          <Stack projects={projects} />
        </div>
      )}
    </section>
  )
}
