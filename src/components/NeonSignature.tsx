import { site } from '../config/site.config'
import styles from './NeonSignature.module.css'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * The author's tradition: every scene carries a neon "made by f4r3n9e1t".
 * "made by" is a serif italic; the nick is monospace so 4 / 3 / 9 / 1 read unambiguously.
 */
export function NeonSignature({ size = 'md', className }: Props) {
  return (
    <span className={`${styles.neon} ${styles[size]} ${className ?? ''}`} data-reveal="">
      <span className={styles.made}>{site.brand.signature}</span>
      <span className={styles.nick}>{site.brand.nick}</span>
    </span>
  )
}
