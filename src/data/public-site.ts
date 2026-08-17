import 'server-only'
import { cache } from 'react'
import {
  analyticsDeviceType,
  analyticsReferrerHost,
  analyticsUtmSource,
  hashAnalyticsVisitor,
} from '@/lib/analytics/public-event'
import { parsePublicSite, type PublicSite } from '@/lib/public-site/schema'
import { isPublicSiteSlug } from '@/lib/public-site/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPublicClient } from '@/lib/supabase/public'

export const getPublicSiteBySlug = cache(
  async (slug: string): Promise<PublicSite | null> => {
    if (!isPublicSiteSlug(slug)) return null

    const client = createPublicClient()
    if (!client) return null

    const { data, error } = await client.rpc('get_public_site', {
      requested_slug: slug,
    })

    if (error || !data) return null
    return parsePublicSite(data)
  },
)

export async function resolvePublicSiteSlugByHostname(
  hostname: string,
): Promise<string | null> {
  const client = createPublicClient()
  if (!client) return null

  const { data, error } = await client.rpc('resolve_public_site_slug', {
    requested_hostname: hostname,
  })

  return error ? null : data
}

type PublicSiteEventType =
  | 'page_view'
  | 'phone_click'
  | 'directions_click'
  | 'contact_click'
  | 'estimate_request'

export type PublicAnalyticsContext = {
  visitorId?: string | null
  referrer?: string | null
  currentHost?: string | null
  viewportWidth?: number | null
  utmSource?: string | null
}

async function recordPublicSiteEvent(
  slug: string,
  path: string,
  eventType: PublicSiteEventType,
  source: string,
  context: PublicAnalyticsContext = {},
): Promise<boolean> {
  if (!isPublicSiteSlug(slug)) return false

  let client: ReturnType<typeof createAdminClient>
  try {
    client = createAdminClient()
  } catch {
    return false
  }

  const { data, error } = await client.rpc('record_public_site_event', {
    requested_event_type: eventType,
    requested_path: path,
    requested_slug: slug,
    requested_source: source,
    requested_anonymous_session_hash:
      hashAnalyticsVisitor(slug, context.visitorId) ?? undefined,
    requested_referrer_host:
      context.currentHost && context.referrer
        ? (analyticsReferrerHost(context.referrer, context.currentHost) ??
          undefined)
        : undefined,
    requested_device_type:
      analyticsDeviceType(context.viewportWidth) ?? undefined,
    requested_utm_source: analyticsUtmSource(context.utmSource) ?? undefined,
  })

  return !error && data === true
}

export function recordPublicPhoneClick(
  slug: string,
  path: string,
  context: PublicAnalyticsContext,
) {
  return recordPublicSiteEvent(
    slug,
    path,
    'phone_click',
    'public_phone_link',
    context,
  )
}

export function recordPublicPageView(
  slug: string,
  path: string,
  context: PublicAnalyticsContext,
) {
  return recordPublicSiteEvent(
    slug,
    path,
    'page_view',
    'public_page_view',
    context,
  )
}

export function recordPublicActionClick(
  slug: string,
  path: string,
  action: 'directions' | 'contact',
  context: PublicAnalyticsContext,
) {
  return recordPublicSiteEvent(
    slug,
    path,
    action === 'directions' ? 'directions_click' : 'contact_click',
    `public_${action}_link`,
    context,
  )
}

export function recordPublicEstimateRequest(
  slug: string,
  path: string,
  context: PublicAnalyticsContext,
) {
  return recordPublicSiteEvent(
    slug,
    path,
    'estimate_request',
    'accepted_estimate_request',
    context,
  )
}
