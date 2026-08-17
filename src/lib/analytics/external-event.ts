import 'server-only'
import { z } from 'zod'
import {
  analyticsDeviceType,
  analyticsReferrerHost,
  analyticsUtmSource,
  hashAnalyticsVisitor,
} from '@/lib/analytics/public-event'
import { createAdminClient } from '@/lib/supabase/admin'

const externalEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'phone_click',
    'directions_click',
    'contact_click',
    'estimate_request',
  ]),
  path: z.string().startsWith('/').max(500),
  visitorId: z.string().max(80).nullable().optional(),
  referrer: z.string().max(2000).nullable().optional(),
  viewportWidth: z.number().int().positive().max(10_000).nullable().optional(),
  utmSource: z.string().max(120).nullable().optional(),
})

export async function recordExternalAnalyticsEvent({
  siteKey,
  origin,
  body,
}: {
  siteKey: string
  origin: string
  body: unknown
}): Promise<boolean> {
  const key = z.string().uuid().safeParse(siteKey)
  const event = externalEventSchema.safeParse(body)
  if (!key.success || !event.success) return false

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    return false
  }
  if (originUrl.protocol !== 'https:' && originUrl.protocol !== 'http:') {
    return false
  }
  const originHostname = originUrl.hostname.toLowerCase().replace(/\.$/, '')
  if (!originHostname) return false

  let client: ReturnType<typeof createAdminClient>
  try {
    client = createAdminClient()
  } catch {
    return false
  }

  const { data, error } = await client.rpc('record_external_site_event', {
    requested_site_key: key.data,
    requested_origin_hostname: originHostname,
    requested_event_type: event.data.eventType,
    requested_path: event.data.path,
    requested_source: 'external_site_tracker',
    requested_anonymous_session_hash:
      hashAnalyticsVisitor(key.data, event.data.visitorId) ?? undefined,
    requested_referrer_host:
      analyticsReferrerHost(event.data.referrer, originHostname) ?? undefined,
    requested_device_type:
      analyticsDeviceType(event.data.viewportWidth) ?? undefined,
    requested_utm_source: analyticsUtmSource(event.data.utmSource) ?? undefined,
  })

  return !error && data === true
}
