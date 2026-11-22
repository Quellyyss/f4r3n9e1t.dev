import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { site } from '../config/site.config'
import type { ImageMedia, Media } from '../config/types'
import { BucketImage } from '../components/BucketImage'
import { VideoPlayer } from '../components/VideoPlayer'
import { Lightbox } from '../components/Lightbox'
import { RevealText } from '../components/RevealText'
import { TransitionLink } from '../components/TransitionLink'
import NotFound from './NotFound'
import styles from './Project.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

function MediaBlock({ media, sizes, onOpen }: { media: Media; sizes: string; onOpen?: () => void }) {
  if (media.type === 'video') return <VideoPlayer media={media} />
  const img = <BucketImage media={media} sizes={sizes} />
  return onOpen ? (
    <button type="button" className={styles.zoom} onClick={onOpen} data-cursor="View" aria-label={`Open: ${media.alt}`}>
      {img}
    </button>
  ) : (
    img
  )
}

/** gallery tiles take columns by shape so the grid stays asymmetric but never random */
function span(m: Media, i: number) {
  const r = m.width / m.height
  if (r > 1.6) return 'wide'
  if (r < 0.8) return i % 2 ? 'tallRight' : 'tallLeft'
  return i % 3 === 1 ? 'squareRight' : 'square'
}

export default function Project() {
  const { slug } = useParams()
  const index = site.projects.findIndex((p) => p.slug === slug)
  const project = site.projects[index]
  const [lightbox, setLightbox] = useState<number | null>(null)

  const images = useMemo(
    () => (project ? project.gallery.filter((m): m is ImageMedia => m.type === 'image') : []),
    [project],
  )

  useEffect(() => {
    if (project) document.title = `${project.title} — ${site.brand.signature} ${site.brand.nick}`
    return () => {
      document.title = site.brand.siteTitle
    }
  }, [project])

  if (!project) return <NotFound />

  const cat = site.categories.find((c) => c.id === project.category)!
  const next = site.projects[(index + 1) % site.projects.length]
  const portrait = project.cover.width / project.cover.height < 1.3

  return (
    <article className={styles.page}>
      {/* ── hero ─────────────────────────────────────── */}
      <header className={`${styles.hero} ${portrait ? styles.heroPortrait : ''}`}>
        <div className={styles.heroMedia} style={{ '--ar': `${project.cover.width} / ${project.cover.height}` } as CSSProperties}>
          <BucketImage media={project.cover} sizes={portrait ? '(min-width: 900px) 45vw, 100vw' : '100vw'} priority fill />
        </div>
        <div className={styles.heroText}>
          <TransitionLink to="/#work" className={`meta ${styles.back}`}>
            ← All work
          </TransitionLink>
          <p className="meta" data-reveal="">
            <span className={styles.red}>{cat.index}</span> {cat.label} · {project.year} · {pad(index + 1)} / {pad(site.projects.length)}
            {project.status === 'demo' && <span className={styles.demo}>Demo slot — placeholder artwork</span>}
          </p>
          <RevealText as="h1" text={project.title} className={styles.title} />
          <p className={styles.summary} data-reveal="" style={{ '--delay': '160ms' } as CSSProperties}>
            {project.summary}
          </p>
        </div>
      </header>

      {/* ── idea ─────────────────────────────────────── */}
      <section className={`wrap ${styles.block}`} aria-labelledby="idea">
        <h2 id="idea" className={`meta ${styles.label}`}>
          <span className={styles.red}>A</span> Idea
        </h2>
        <div className={styles.idea}>
          {project.idea.map((p, i) => (
            <p key={i} data-reveal="" style={{ '--delay': `${i * 90}ms` } as CSSProperties}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {project.film && (
        <section className={`wrap ${styles.block}`} aria-label="Film">
          <h2 className={`meta ${styles.label}`}>
            <span className={styles.red}>▶</span> Film
          </h2>
          <div className={project.film.height > project.film.width ? styles.filmTall : styles.filmWide}>
            <VideoPlayer media={project.film} />
          </div>
        </section>
      )}

      {/* ── process ──────────────────────────────────── */}
      {project.process.length > 0 && (
        <section className={`wrap ${styles.block}`} aria-labelledby="process">
          <h2 id="process" className={`meta ${styles.label}`}>
            <span className={styles.red}>B</span> Process
          </h2>
          <ol className={styles.process}>
            {project.process.map((step, i) => (
              <li key={step.title} className={styles.step} data-has-media={step.media ? '' : undefined}>
                <div className={styles.stepText} data-reveal="">
                  <span className={`meta ${styles.red}`}>Step {pad(i + 1)}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {step.media && (
                  <div className={styles.stepMedia}>
                    <MediaBlock media={step.media} sizes="(min-width: 900px) 66vw, 100vw" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── renders ──────────────────────────────────── */}
      {project.gallery.length > 0 && (
        <section className={`wrap ${styles.block}`} aria-labelledby="renders">
          <h2 id="renders" className={`meta ${styles.label}`}>
            <span className={styles.red}>C</span> Renders <span className={styles.count}>{pad(project.gallery.length)}</span>
          </h2>
          <div className={styles.gallery}>
            {project.gallery.map((m, i) => (
              <figure key={m.src} className={styles[span(m, i)]}>
                <MediaBlock
                  media={m}
                  sizes="(min-width: 900px) 50vw, 100vw"
                  onOpen={m.type === 'image' ? () => setLightbox(images.indexOf(m)) : undefined}
                />
                {m.caption && <figcaption className="meta">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── specs ────────────────────────────────────── */}
      <section className={`wrap ${styles.block}`} aria-labelledby="specs">
        <h2 id="specs" className={`meta ${styles.label}`}>
          <span className={styles.red}>D</span> Technical
        </h2>
        <div className={styles.specs}>
          <dl>
            {project.tech.map((t) => (
              <div key={t.label} data-reveal="">
                <dt className="meta">{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
          </dl>
          {project.tools.length > 0 && (
            <div className={styles.tools} data-reveal="">
              <span className="meta">Tools</span>
              <ul>
                {project.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── next ─────────────────────────────────────── */}
      {next && next.slug !== project.slug && (
        <TransitionLink to={`/work/${next.slug}`} className={`wrap ${styles.next}`} data-cursor="Next">
          <span className="meta">Next render</span>
          <span className={styles.nextTitle}>{next.title}</span>
          <span className={styles.nextThumb} aria-hidden="true">
            <img src={next.cover.srcSmall ?? next.cover.src} alt="" loading="lazy" />
          </span>
        </TransitionLink>
      )}

      <Lightbox items={images} index={lightbox} onChange={setLightbox} />
    </article>
  )
}
