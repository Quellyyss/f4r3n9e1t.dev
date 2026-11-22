import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { VideoMedia } from '../config/types'
import { useReducedMotion } from '../hooks/useMediaQuery'
import styles from './VideoPlayer.module.css'

/**
 * Loads nothing until it is near the viewport, then plays muted and looped
 * (unless reduced motion is on — then it waits for a click). Sound is opt-in.
 */
export function VideoPlayer({ media, className }: { media: VideoMedia; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [near, setNear] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const el = box.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true)
        const v = ref.current
        if (!v || !v.src) return
        if (!e.isIntersecting && !v.paused) v.pause()
        else if (e.isIntersecting && !reduced && v.paused && v.dataset.userPaused !== '1') v.play().catch(() => {})
      },
      { rootMargin: '200px 0px', threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  useEffect(() => {
    const v = ref.current
    if (near && v && !reduced) v.play().catch(() => {})
  }, [near, reduced])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      v.dataset.userPaused = '0'
      v.play().catch(() => {})
    } else {
      v.dataset.userPaused = '1'
      v.pause()
    }
  }

  return (
    <div
      ref={box}
      className={`${styles.player} ${className ?? ''}`}
      style={{ aspectRatio: `${media.width} / ${media.height}` } as CSSProperties}
    >
      <video
        ref={ref}
        className={styles.video}
        src={near ? media.src : undefined}
        poster={media.poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        {media.hasAudio && (
          <button
            type="button"
            className={styles.btn}
            onClick={() => setMuted((m) => !m)}
            aria-pressed={!muted}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          >
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        )}
      </div>
    </div>
  )
}
