import { useEffect, useRef } from 'react'
import type { ImageMedia } from '../config/types'
import { lockScroll } from '../animations/smoothScroll'
import styles from './Lightbox.module.css'

interface Props {
  items: ImageMedia[]
  index: number | null
  onChange: (i: number | null) => void
}

/** Full-screen viewer for project renders. Esc closes, ← → step through. */
export function Lightbox({ items, index, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const open = index !== null

  useEffect(() => {
    const d = dialog.current!
    if (open && !d.open) {
      d.showModal()
      lockScroll(true)
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  useEffect(() => () => lockScroll(false), [])

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onChange(((index ?? 0) + 1) % items.length)
      if (e.key === 'ArrowLeft') onChange(((index ?? 0) - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open, index, items.length, onChange])

  const item = index !== null ? items[index] : null

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Render viewer"
      onClose={() => {
        lockScroll(false)
        onChange(null)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close()
      }}
    >
      {item && (
        <figure className={styles.figure}>
          <img src={item.src} alt={item.alt} width={item.width} height={item.height} className={styles.img} />
          <figcaption className={`meta ${styles.caption}`}>
            <span>
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <span>{item.caption ?? item.alt}</span>
          </figcaption>
        </figure>
      )}
      <div className={styles.nav}>
        {items.length > 1 && (
          <>
            <button type="button" className={styles.btn} onClick={() => onChange(((index ?? 0) - 1 + items.length) % items.length)}>
              ← Prev
            </button>
            <button type="button" className={styles.btn} onClick={() => onChange(((index ?? 0) + 1) % items.length)}>
              Next →
            </button>
          </>
        )}
        <button type="button" className={styles.btn} onClick={() => dialog.current?.close()} autoFocus>
          Close
        </button>
      </div>
    </dialog>
  )
}
