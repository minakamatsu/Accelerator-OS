import type { ReactNode } from 'react'
import styles from './pipeline.module.css'

export function InfoTip({
  children,
  label,
}: Readonly<{ children: ReactNode; label: string }>) {
  return (
    <details className={styles.infoTip}>
      <summary aria-label={label}>i</summary>
      <p>{children}</p>
    </details>
  )
}
