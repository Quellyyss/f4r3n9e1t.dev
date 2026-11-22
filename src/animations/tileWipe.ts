import { spiralRanks } from './buckets'

/**
 * Full-screen bucket wipe drawn on one 2D canvas.
 * cover(): tiles appear in spiral order until the screen is graphite.
 * reveal(): tiles disappear in the same order, uncovering the new page.
 * The leading tiles get a thin red outline — the "active bucket" of a render.
 */
export class TileWipe {
  private ctx: CanvasRenderingContext2D
  private cols = 0
  private rows = 0
  private size = 0
  private ranks: number[] = []
  private raf = 0
  private covered = 0 // 0 = clear, 1 = covered

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.layout()
  }

  layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.size = w < 720 ? 56 : 88
    this.cols = Math.ceil(w / this.size)
    this.rows = Math.ceil(h / this.size)
    this.ranks = spiralRanks(this.cols, this.rows)
    this.draw(this.covered, true)
  }

  /** p: 0..1 animation progress; covering = tiles appear (true) or disappear (false) */
  private draw(p: number, covering: boolean) {
    const { ctx, size, cols } = this
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    const spread = 0.82 // how much of the timeline the stagger takes
    const lead: [number, number][] = []
    for (let i = 0; i < this.ranks.length; i++) {
      const start = this.ranks[i] * spread
      const local = Math.min(1, Math.max(0, (p - start) / (1 - spread)))
      const visible = covering ? local : 1 - local
      if (visible <= 0) continue
      const x = (i % cols) * size
      const y = Math.floor(i / cols) * size
      ctx.fillStyle = '#0e0e10'
      ctx.fillRect(x, y, size + 0.5, size + 0.5)
      if (local > 0 && local < 1) lead.push([x, y])
    }
    ctx.strokeStyle = '#d0161f'
    ctx.lineWidth = 1
    for (const [x, y] of lead) ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)
  }

  private run(covering: boolean, duration: number) {
    cancelAnimationFrame(this.raf)
    this.canvas.style.visibility = 'visible'
    return new Promise<void>((resolve) => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        this.draw(p, covering)
        if (p < 1) this.raf = requestAnimationFrame(tick)
        else {
          this.covered = covering ? 1 : 0
          if (!covering) this.canvas.style.visibility = 'hidden'
          resolve()
        }
      }
      this.raf = requestAnimationFrame(tick)
    })
  }

  cover(duration = 520) {
    return this.run(true, duration)
  }

  reveal(duration = 620) {
    return this.run(false, duration)
  }

  setCovered() {
    cancelAnimationFrame(this.raf)
    this.covered = 1
    this.canvas.style.visibility = 'visible'
    this.draw(1, true)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }
}
