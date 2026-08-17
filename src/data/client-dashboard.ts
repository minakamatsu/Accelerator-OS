import 'server-only'
import {
  analyticsPreviousRangeStart,
  buildClientDashboardMetrics,
  type AnalyticsRange,
  type ClientDashboardMetrics,
} from '@/lib/analytics/dashboard'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'

export type ClientDashboard = {
  business: {
    id: string
    name: string
    slug: string
    status: 'draft' | 'active' | 'suspended' | 'archived'
    websiteUrl: string | null
  }
  metrics: ClientDashboardMetrics
}

export async function getClientDashboard(
  businessId: string,
  days: AnalyticsRange,
): Promise<ClientDashboard | null> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const now = new Date()
  const from = analyticsPreviousRangeStart(days, now).toISOString()

  const [businessResult, eventsResult, requestsResult] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, slug, status, business_profiles(website_url)')
      .eq('id', businessId)
      .maybeSingle(),
    supabase
      .from('site_events')
      .select(
        'event_type, anonymous_session_hash, path, referrer_host, utm_source, device_type, created_at',
      )
      .eq('business_id', businessId)
      .gte('created_at', from)
      .order('created_at'),
    supabase
      .from('leads')
      .select('created_at')
      .eq('business_id', businessId)
      .gte('created_at', from)
      .order('created_at'),
  ])

  if (businessResult.error) {
    throw new Error('Unable to load the client business.')
  }
  if (!businessResult.data) return null
  if (eventsResult.error || requestsResult.error) {
    throw new Error('Unable to load website performance.')
  }

  return {
    business: {
      id: businessResult.data.id,
      name: businessResult.data.name,
      slug: businessResult.data.slug,
      status: businessResult.data.status,
      websiteUrl: businessResult.data.business_profiles?.website_url ?? null,
    },
    metrics: buildClientDashboardMetrics({
      days,
      now,
      events: eventsResult.data.map((event) => ({
        eventType: event.event_type,
        createdAt: event.created_at,
        anonymousVisitorHash: event.anonymous_session_hash,
        path: event.path,
        referrerHost: event.referrer_host,
        utmSource: event.utm_source,
        deviceType: event.device_type,
      })),
      requests: requestsResult.data.map((request) => ({
        createdAt: request.created_at,
      })),
    }),
  }
}
