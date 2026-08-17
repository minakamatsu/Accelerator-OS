'use client'

import type { ReactNode } from 'react'
import { getAnalyticsVisitorId } from '@/lib/analytics/browser'

type Props = {
  href: string
  eventPath: string
  action: 'directions' | 'contact'
  className?: string
  children: ReactNode
  target?: '_blank'
  rel?: string
}

export function TrackedActionLink({
  href,
  eventPath,
  action,
  className,
  children,
  target,
  rel,
}: Props) {
  function recordClick() {
    void fetch(eventPath, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        path: window.location.pathname,
        visitorId: getAnalyticsVisitorId(),
      }),
    }).catch(() => undefined)
  }

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={recordClick}
    >
      {children}
    </a>
  )
}
