'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'

export function RefreshDataButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function refreshData() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      className={styles.refreshButton}
      onClick={refreshData}
      disabled={isPending}
      aria-label={
        isPending ? 'Refreshing website data' : 'Refresh website data'
      }
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        data-refreshing={isPending ? 'true' : undefined}
      >
        <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />
      </svg>
      <span aria-live="polite">
        {isPending ? 'Refreshing…' : 'Refresh data'}
      </span>
    </button>
  )
}
