import { useMemo, useState, type CSSProperties } from 'react'
import type { ImageMedia } from '../config/types'
import { spiralRanks } from '../animations/buckets'
import styles from './BucketImage.module.css'

interface Props {
  media: ImageMedia
  sizes?: string
  /** load immediately (hero images) instead of lazily */
  priority?: boolean
  className?: string
  /** stretch to the parent's box instead of keeping the file's ratio */
  fill?: boolean
}

const COLS = 6

/**
 * An image that "renders in" bucket by bucket, in Cycles' spiral order,
 * once it is both loaded and inside the viewport.
 */
export function BucketImage({ media, sizes = '100vw', priority, className, fill }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const ratio = media.width / media.height
  const rows = Math.max(2, Math.round(COLS / ratio))
  const ranks = useMemo(() => spiralRanks(COLS, rows), [rows])
  const smallWidth = Math.round(media.width * Math.min(1, 960 / Math.max(media.width, media.height)))
  const srcSet = media.srcSmall ? `${media.srcSmall} ${smallWidth}w, ${media.src} ${media.width}w` : undefined

  return (
    <div
      className={`${styles.frame} ${fill ? styles.fill : ''} ${className ?? ''}`}
      style={fill ? undefined : ({ aspectRatio: `${media.width} / ${media.height}` } as CSSProperties)}
      data-bucket=""
      data-loaded={loaded || failed ? '' : undefined}
    >
      {failed ? (
        <div className={styles.missing}>
          <span className="meta">Image missing</span>
          <span className="meta">{media.src}</span>
        </div>
      ) : (
        <img
          src={media.src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          width={media.width}
          height={media.height}
          alt={media.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={styles.img}
        />
      )}
      <div className={styles.tiles} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {ranks.map((r, i) => (
          <span key={i} style={{ '--r': r } as CSSProperties} />
        ))}
      </div>
    </div>
  )
}
