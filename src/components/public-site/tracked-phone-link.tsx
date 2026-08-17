'use client'

import type { ReactNode } from 'react'
import { getAnalyticsVisitorId } from '@/lib/analytics/browser'

type Props = {
  href: string
  eventPath: string
  className?: string
  children: ReactNode
  ariaLabel?: string
}

export function TrackedPhoneLink({
  href,
  eventPath,
  className,
  children,
  ariaLabel,
}: Props) {
  function recordClick() {
    void fetch(eventPath, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        visitorId: getAnalyticsVisitorId(),
      }),
    }).catch(() => undefined)
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={recordClick}
    >
      {children}
    </a>
  )
}
