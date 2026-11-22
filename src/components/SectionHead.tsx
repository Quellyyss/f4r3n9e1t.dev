import type { ReactNode } from 'react'
import styles from './SectionHead.module.css'

interface Props {
  index: string
  title: string
  aside?: ReactNode
}

/** "[01] Portfolio ———— aside" — the same header for every home section. */
export function SectionHead({ index, title, aside }: Props) {
  return (
    <div className={styles.head} data-reveal="">
      <span className={styles.index}>[{index}]</span>
      <span className={styles.title}>{title}</span>
      <span className={styles.rule} aria-hidden="true" />
      {aside && <span className={styles.aside}>{aside}</span>}
    </div>
  )
}
