import { useState, type CSSProperties } from 'react'
import { site } from '../config/site.config'
import { SectionHead } from '../components/SectionHead'
import { Magnetic } from '../components/Magnetic'
import styles from './Contact.module.css'

function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2200)
  }
  return (
    <Magnetic>
      <button type="button" className={styles.copy} onClick={copy} data-cursor={state === 'copied' ? 'Copied' : 'Copy'}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select & copy' : 'Copy'}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {state === 'copied' ? 'Email address copied' : ''}
      </span>
    </Magnetic>
  )
}

export function Contact() {
  const { contact } = site
  const socials = contact.socials.filter((s) => contact.showEmpty || s.value)

  return (
    <section id="contact" className={`wrap ${styles.contact}`} aria-labelledby="contact-title">
      <SectionHead index="04" title="Contact" aside="Commissions & collaborations" />

      <h2 id="contact-title" className={styles.headline} data-reveal-words="">
        {contact.headline.map((line, i) =>
          i === contact.outlineLine ? (
            <span key={line} className={`${styles.line} ${styles.wire}`} data-text={line} style={{ '--i': i } as CSSProperties}>
              <span className="rw">
                <span>{line}</span>
              </span>
            </span>
          ) : (
            <span key={line} className={styles.line} style={{ '--i': i } as CSSProperties}>
              <span className="rw">
                <span>{line}</span>
              </span>
            </span>
          ),
        )}
      </h2>

      <dl className={styles.list}>
        <div className={styles.row} data-reveal="">
          <dt className="meta">Email</dt>
          {contact.email ? (
            <dd className={styles.value}>
              <a href={`mailto:${contact.email}`} className={styles.link}>
                {contact.email}
              </a>
              <CopyEmail email={contact.email} />
            </dd>
          ) : (
            <dd className={`${styles.value} ${styles.empty}`}>Address coming soon</dd>
          )}
        </div>
        {socials.map((s, i) => (
          <div key={s.label} className={styles.row} data-reveal="" style={{ '--delay': `${(i + 1) * 60}ms` } as CSSProperties}>
            <dt className="meta">{s.label}</dt>
            {s.value && s.url ? (
              <dd className={styles.value}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {s.value}
                  <span aria-hidden="true"> ↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </dd>
            ) : s.value ? (
              <dd className={styles.value}>{s.value}</dd>
            ) : (
              <dd className={`${styles.value} ${styles.empty}`}>Not linked yet</dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  )
}
