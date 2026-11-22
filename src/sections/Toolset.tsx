import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { site } from '../config/site.config'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { SectionHead } from '../components/SectionHead'
import { RevealText } from '../components/RevealText'
import styles from './Toolset.module.css'

/**
 * The toolset as a Blender node tree: every tool is a node, every discipline is a socket
 * on the output node, noodles show which tool feeds what. No skill percentages anywhere.
 */

type Pos = { x: number; y: number } // fractions of the canvas size

function initialLayout(count: number): Pos[] {
  const perCol = Math.ceil(count / 2)
  return Array.from({ length: count }, (_, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    return { x: col === 0 ? 0.025 : 0.29, y: 0.05 + (row / Math.max(1, perCol - 1)) * 0.68 + (col ? 0.08 : 0) }
  })
}

function Graph() {
  const tools = site.tools
  const disciplines = site.disciplines
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos[]>(() => initialLayout(tools.length))
  const [out, setOut] = useState<Pos | null>(null) // null = anchored to the right edge
  const [paths, setPaths] = useState<{ d: string; tool: number; disc: string }[]>([])
  const [hot, setHot] = useState<{ tool?: number; disc?: string } | null>(null)
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null)

  const measure = useCallback(() => {
    const b = box.current
    if (!b) return
    const br = b.getBoundingClientRect()
    const center = (el: Element | null) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - br.left + r.width / 2, y: r.top - br.top + r.height / 2 }
    }
    const next: { d: string; tool: number; disc: string }[] = []
    tools.forEach((t, i) => {
      const a = center(b.querySelector(`[data-out="${i}"]`))
      t.feeds.forEach((disc) => {
        const z = center(b.querySelector(`[data-in="${CSS.escape(disc)}"]`))
        if (!a || !z) return
        const k = Math.max(60, Math.abs(z.x - a.x) * 0.5)
        next.push({ d: `M${a.x},${a.y} C${a.x + k},${a.y} ${z.x - k},${z.y} ${z.x},${z.y}`, tool: i, disc })
      })
    })
    setPaths(next)
  }, [tools])

  useLayoutEffect(measure, [pos, out, measure])
  useEffect(() => {
    const ro = new ResizeObserver(measure)
    ro.observe(box.current!)
    return () => ro.disconnect()
  }, [measure])

  const startDrag = (id: number) => (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const node = (e.currentTarget as HTMLElement).parentElement!
    const r = node.getBoundingClientRect()
    drag.current = { id, dx: e.clientX - r.left, dy: e.clientY - r.top }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDrag = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current
    const b = box.current
    if (!d || !b) return
    const br = b.getBoundingClientRect()
    const node = (e.currentTarget as HTMLElement).parentElement!
    const PAD = 16
    const minX = PAD / br.width
    const minY = PAD / br.height
    const maxX = 1 - (node.offsetWidth + PAD) / br.width
    const maxY = 1 - (node.offsetHeight + PAD) / br.height
    const p = {
      x: Math.min(maxX, Math.max(minX, (e.clientX - br.left - d.dx) / br.width)),
      y: Math.min(maxY, Math.max(minY, (e.clientY - br.top - d.dy) / br.height)),
    }
    if (d.id === -1) setOut(p)
    else setPos((all) => all.map((q, i) => (i === d.id ? p : q)))
  }
  const endDrag = () => {
    drag.current = null
  }

  const isHot = (tool: number, disc: string) =>
    !!hot && ((hot.tool !== undefined && hot.tool === tool) || (hot.disc !== undefined && hot.disc === disc))
  const feeders = (disc: string) => tools.filter((t) => t.feeds.includes(disc)).length

  return (
    <div ref={box} className={styles.graph} onPointerLeave={() => setHot(null)}>
      <svg className={styles.noodles} aria-hidden="true">
        {paths.map((p) => (
          <path key={`${p.tool}-${p.disc}`} d={p.d} data-hot={isHot(p.tool, p.disc) || undefined} />
        ))}
      </svg>

      {tools.map((t, i) => (
        <div
          key={t.name}
          className={styles.node}
          style={{ left: `${pos[i].x * 100}%`, top: `${pos[i].y * 100}%` }}
          data-hot={hot?.tool === i || (hot?.disc && t.feeds.includes(hot.disc)) || undefined}
          onPointerEnter={() => setHot({ tool: i })}
        >
          <div
            className={styles.nodeHead}
            onPointerDown={startDrag(i)}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            data-cursor="Drag"
          >
            {t.name}
          </div>
          <div className={styles.nodeBody}>
            <span>{t.role}</span>
            <span className={styles.outRow}>
              Feeds {t.feeds.length}
              <i className={styles.socket} data-out={i} />
            </span>
          </div>
        </div>
      ))}

      <div className={`${styles.node} ${styles.output}`} style={out ? { left: `${out.x * 100}%`, top: `${out.y * 100}%` } : { right: '4%', top: '14%' }}>
        <div
          className={styles.nodeHead}
          onPointerDown={startDrag(-1)}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          data-cursor="Drag"
        >
          Output · {site.brand.nick}
        </div>
        <ul className={styles.nodeBody}>
          {disciplines.map((d) => (
            <li
              key={d}
              className={styles.inRow}
              data-hot={hot?.disc === d || (hot?.tool !== undefined && tools[hot.tool].feeds.includes(d)) || undefined}
              onPointerEnter={() => setHot({ disc: d })}
            >
              <i className={styles.socket} data-in={d} />
              {d}
              <span className={styles.feedCount}>{feeders(d)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** phones: the same information without noodles */
function List() {
  return (
    <div className={styles.list}>
      {site.tools.map((t) => (
        <div key={t.name} className={styles.node} data-static="">
          <div className={styles.nodeHead}>{t.name}</div>
          <div className={styles.nodeBody}>
            <span>{t.role}</span>
            <span className={styles.chips}>
              {t.feeds.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Toolset() {
  const wide = useMediaQuery('(min-width: 900px)')
  return (
    <section id="toolset" className={`wrap ${styles.toolset}`} aria-labelledby="toolset-title">
      <SectionHead index="03" title="Toolset" aside={wide ? 'Drag the nodes' : undefined} />
      <div className={styles.head}>
        <RevealText as="h2" id="toolset-title" text="Made in Blender. Driven by imagination." className={styles.h2} />
        <p className={styles.note} data-reveal="">
          The pipeline as a node tree — each tool is wired to the part of the work it feeds. Hover a node or a
          socket to trace it.
        </p>
      </div>
      {wide ? <Graph /> : <List />}
    </section>
  )
}
