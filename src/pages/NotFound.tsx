import { useEffect } from 'react'
import { site } from '../config/site.config'
import { TransitionLink } from '../components/TransitionLink'
import styles from './NotFound.module.css'

export default function NotFound() {
  useEffect(() => {
    document.title = `Not found — ${site.brand.signature} ${site.brand.nick}`
    return () => {
      document.title = site.brand.siteTitle
    }
  }, [])
  return (
    <section className={`wrap ${styles.page}`}>
      <p className="meta">Error · empty frame</p>
      <h1 className={styles.title}>Nothing rendered here.</h1>
      <p className={styles.text}>The address points to a frame that was never rendered — or was moved.</p>
      <TransitionLink to="/" className={styles.link}>
        Back to the start →
      </TransitionLink>
    </section>
  )
}
