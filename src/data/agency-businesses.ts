import 'server-only'
import { randomUUID } from 'node:crypto'
import type { z } from 'zod'
import { requirePlatformAdmin } from '@/lib/auth/guards'
import {
  agencyBusinessSchema,
  internalBusinessSlug,
  websiteHostname,
} from '@/lib/agency-business/schema'
import { createClient } from '@/lib/supabase/server'

export type BusinessLifecycle = 'draft' | 'active' | 'suspended' | 'archived'
export type AnalyticsConnectionState =
  'disconnected' | 'pending' | 'connected' | 'error'

export type AgencyBusiness = {
  id: string
  name: string
  slug: string
  status: BusinessLifecycle
  timezone: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  websiteUrl: string | null
  addressLine1: string | null
  city: string | null
  region: string | null
  postalCode: string | null
  analytics: {
    siteKey: string
    allowedHostname: string | null
    status: AnalyticsConnectionState
    lastEventAt: string | null
  } | null
}

export class AgencyBusinessError extends Error {}

async function adminClient() {
  const access = await requirePlatformAdmin()
  if (access.mode !== 'authenticated') {
    throw new AgencyBusinessError(
      'Connect local Supabase to manage agency businesses.',
    )
  }
  return createClient()
}

function shapeBusiness(row: {
  id: string
  name: string
  slug: string
  status: BusinessLifecycle
  timezone: string
  client_contact_name: string | null
  client_contact_email: string | null
  client_contact_phone: string | null
  business_profiles: {
    website_url: string | null
    address_line_1: string | null
    city: string | null
    region: string | null
    postal_code: string | null
  } | null
  analytics_connections: {
    site_key: string
    allowed_hostname: string | null
    status: AnalyticsConnectionState
    last_event_at: string | null
  } | null
}): AgencyBusiness {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    timezone: row.timezone,
    contactName: row.client_contact_name,
    contactEmail: row.client_contact_email,
    contactPhone: row.client_contact_phone,
    websiteUrl: row.business_profiles?.website_url ?? null,
    addressLine1: row.business_profiles?.address_line_1 ?? null,
    city: row.business_profiles?.city ?? null,
    region: row.business_profiles?.region ?? null,
    postalCode: row.business_profiles?.postal_code ?? null,
    analytics: row.analytics_connections
      ? {
          siteKey: row.analytics_connections.site_key,
          allowedHostname: row.analytics_connections.allowed_hostname,
          status: row.analytics_connections.status,
          lastEventAt: row.analytics_connections.last_event_at,
        }
      : null,
  }
}

const agencyBusinessSelection = `
  id,
  name,
  slug,
  status,
  timezone,
  client_contact_name,
  client_contact_email,
  client_contact_phone,
  business_profiles (
    website_url,
    address_line_1,
    city,
    region,
    postal_code
  ),
  analytics_connections (
    site_key,
    allowed_hostname,
    status,
    last_event_at
  )
`

export async function listAgencyBusinesses(): Promise<AgencyBusiness[]> {
  const supabase = await adminClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(agencyBusinessSelection)
    .order('name')

  if (error) throw new AgencyBusinessError('Unable to load the business list.')
  return data.map((row) => shapeBusiness(row))
}

export async function getAgencyBusiness(
  businessId: string,
): Promise<AgencyBusiness | null> {
  const supabase = await adminClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(agencyBusinessSelection)
    .eq('id', businessId)
    .maybeSingle()

  if (error) throw new AgencyBusinessError('Unable to load this business.')
  return data ? shapeBusiness(data) : null
}

type AgencyBusinessInput = z.infer<typeof agencyBusinessSchema>

function rpcValues(input: AgencyBusinessInput) {
  return {
    address_line_1: input.addressLine1 ?? undefined,
    business_name: input.name,
    business_timezone: input.timezone,
    city: input.city ?? undefined,
    contact_email: input.contactEmail ?? undefined,
    contact_name: input.contactName ?? undefined,
    contact_phone: input.contactPhone ?? undefined,
    postal_code: input.postalCode ?? undefined,
    region: input.region ?? undefined,
    website_hostname: websiteHostname(input.websiteUrl) ?? undefined,
    website_url: input.websiteUrl ?? undefined,
  }
}

export async function createAgencyBusiness(input: AgencyBusinessInput) {
  const supabase = await adminClient()
  const suffix = randomUUID().replaceAll('-', '').slice(0, 8)
  const { data, error } = await supabase.rpc('create_agency_business', {
    ...rpcValues(input),
    business_slug: internalBusinessSlug(input.name, suffix),
  })

  if (error || !data) {
    throw new AgencyBusinessError('The business could not be added.')
  }
  return data
}

export async function updateAgencyBusiness(
  businessId: string,
  input: AgencyBusinessInput,
) {
  const supabase = await adminClient()
  const { data, error } = await supabase.rpc('update_agency_business', {
    ...rpcValues(input),
    target_business_id: businessId,
  })
  if (error || !data) {
    throw new AgencyBusinessError('The business details could not be saved.')
  }
}

export async function setAgencyBusinessStatus(
  businessId: string,
  status: BusinessLifecycle,
) {
  const supabase = await adminClient()
  const { data, error } = await supabase.rpc('set_agency_business_status', {
    target_business_id: businessId,
    requested_status: status,
  })
  if (error || !data) {
    throw new AgencyBusinessError(
      status === 'active'
        ? 'Add a website address and enable its analytics connection before activation.'
        : 'The business status could not be changed.',
    )
  }
}

export async function setAnalyticsConnectionEnabled(
  businessId: string,
  enabled: boolean,
) {
  const supabase = await adminClient()
  const { data, error } = await supabase.rpc(
    'set_analytics_connection_enabled',
    { target_business_id: businessId, requested_enabled: enabled },
  )
  if (error || !data) {
    throw new AgencyBusinessError(
      enabled
        ? 'Save a website address before enabling analytics.'
        : 'The analytics connection could not be disabled.',
    )
  }
}

export async function rotateAnalyticsSiteKey(businessId: string) {
  const supabase = await adminClient()
  const { data, error } = await supabase.rpc('rotate_analytics_site_key', {
    target_business_id: businessId,
  })
  if (error || !data) {
    throw new AgencyBusinessError('The analytics key could not be rotated.')
  }
}
