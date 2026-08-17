'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  getAnalyticsAttribution,
  getAnalyticsVisitorId,
} from '@/lib/analytics/browser'

export function PublicPageView({
  endpoint,
  businessSlug,
}: {
  endpoint: string
  businessSlug: string
}) {
  const pathname = usePathname()
  const lastRecordedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastRecordedPath.current === pathname) return
    lastRecordedPath.current = pathname
    const attribution = getAnalyticsAttribution(businessSlug)

    void fetch(endpoint, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        visitorId: getAnalyticsVisitorId(),
        referrer: attribution.referrer,
        utmSource: attribution.utmSource,
        viewportWidth: window.innerWidth,
      }),
    }).catch(() => undefined)
  }, [businessSlug, endpoint, pathname])

  return null
}
