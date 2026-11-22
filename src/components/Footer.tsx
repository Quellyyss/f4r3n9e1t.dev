import { site } from '../config/site.config'
import { scrollToTarget } from '../animations/smoothScroll'
import { NeonSignature } from './NeonSignature'
import { Magnetic } from './Magnetic'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={`wrap ${styles.footer}`}>
      <div className={styles.sign}>
        <NeonSignature size="lg" />
      </div>
      <div className={`meta ${styles.bar}`}>
        <span>
          © {new Date().getFullYear()} {site.brand.nick}
        </span>
        <span className={styles.secret}>Type “render” anywhere</span>
        <Magnetic>
          <button type="button" className={styles.top} onClick={() => scrollToTarget(0)}>
            Back to top ↑
          </button>
        </Magnetic>
      </div>
    </footer>
  )
}
