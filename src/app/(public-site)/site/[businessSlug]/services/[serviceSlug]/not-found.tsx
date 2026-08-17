import type { Metadata } from 'next'
import styles from '../../public-site.module.css'

export const metadata: Metadata = {
  title: 'Service page unavailable',
  robots: { index: false, follow: false },
}

export default function ServiceNotFound() {
  return (
    <section className={styles.compactPageHero}>
      <p className={styles.eyebrow}>Service page unavailable</p>
      <h1>That service has not been published.</h1>
      <p>
        Only verified service categories receive their own page. Browse the
        published service guide, or describe what changed so the shop can
        confirm whether it is the right place to start.
      </p>
      <div className={styles.centeredLinkRow}>
        <a className={styles.sectionLink} href="../services">
          Browse verified services <span aria-hidden="true">→</span>
        </a>
        <a className={styles.sectionLink} href="../vehicle-concerns">
          Open the vehicle-concerns guide <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
