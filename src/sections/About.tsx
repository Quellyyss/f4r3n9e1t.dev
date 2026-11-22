import type { CSSProperties } from 'react'
import { site } from '../config/site.config'
import { SectionHead } from '../components/SectionHead'
import { RevealText } from '../components/RevealText'
import { NeonSignature } from '../components/NeonSignature'
import styles from './About.module.css'

export function About() {
  const count = (id: string) => site.projects.filter((p) => p.category === id).length
  return (
    <section id="about" className={`wrap ${styles.about}`} aria-labelledby="about-title">
      <SectionHead index="02" title="About" aside="Independent" />

      <div className={styles.grid}>
        <RevealText as="h2" id="about-title" text={site.about.headline} className={styles.h2} />
        <div className={styles.bio}>
          {site.about.bio.map((p, i) => (
            <p key={i} data-reveal="" style={{ '--delay': `${120 + i * 100}ms` } as CSSProperties}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <ol className={styles.lines}>
        {site.about.lines.map((l, i) => (
          <li key={l} data-reveal="" style={{ '--delay': `${i * 90}ms` } as CSSProperties}>
            <span className={styles.lineIndex}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.lineText}>{l}</span>
          </li>
        ))}
      </ol>

      <div className={styles.directions}>
        <h3 className="meta">Directions</h3>
        <ul>
          {site.categories.map((c, i) => (
            <li key={c.id} data-reveal="" style={{ '--delay': `${i * 60}ms` } as CSSProperties}>
              <span className={styles.dIndex}>{c.index}</span>
              <span className={styles.dLabel}>{c.label}</span>
              <span className={styles.dBlurb}>{c.blurb}</span>
              <span className={`meta ${styles.dCount}`}>
                {count(c.id)} {count(c.id) === 1 ? 'piece' : 'pieces'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sign}>
        <span className="meta">Signed in every scene</span>
        <NeonSignature size="lg" />
      </div>
    </section>
  )
}
