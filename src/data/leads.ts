import 'server-only'
import { z } from 'zod'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import type { PublicLeadInput } from '@/lib/leads/schemas'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const captureResultSchema = z.object({
  accepted: z.boolean(),
  duplicate: z.boolean(),
  leadId: z.string().uuid().optional(),
})

export type CapturePublicLeadRequest = Omit<
  PublicLeadInput,
  'analyticsVisitorId'
> & {
  slug: string
  fingerprintHash: string
  consentText: string
  consentVersion: string
}

export async function capturePublicLead(
  request: CapturePublicLeadRequest,
): Promise<{ accepted: boolean; duplicate: boolean; leadId?: string }> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('capture_public_lead', {
    requested_slug: request.slug,
    requested_idempotency_key: request.idempotencyKey,
    requested_fingerprint_hash: request.fingerprintHash,
    requested_full_name: request.fullName,
    requested_email: request.email ?? '',
    requested_phone: request.phone ?? '',
    requested_service_slug: request.serviceSlug ?? '',
    requested_service_request: request.serviceRequest,
    requested_vehicle_year: request.vehicleYear ?? (null as never),
    requested_vehicle_make: request.vehicleMake ?? '',
    requested_vehicle_model: request.vehicleModel ?? '',
    requested_message: request.message ?? '',
    requested_source: request.source ?? 'website_quote',
    requested_utm_source: request.utmSource ?? '',
    requested_utm_medium: request.utmMedium ?? '',
    requested_utm_campaign: request.utmCampaign ?? '',
    requested_consent_text: request.consentText,
    requested_consent_version: request.consentVersion,
  })

  if (error) throw new Error(error.message)
  const parsed = captureResultSchema.safeParse(data)
  if (!parsed.success)
    throw new Error('Lead capture returned an invalid result.')
  return parsed.data
}

export type PipelineBusiness = {
  id: string
  name: string
  slug: string
}

export type PipelineLead = {
  id: string
  status: 'new' | 'contacted' | 'estimate_sent' | 'won' | 'lost'
  fullName: string
  email: string | null
  phone: string | null
  serviceRequest: string | null
  vehicleLabel: string | null
  source: string | null
  estimatedValueMinor: number | null
  wonValueMinor: number | null
  createdAt: string
}

export async function getPipelineBusiness(
  businessId: string,
): Promise<PipelineBusiness | null> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('id', businessId)
    .maybeSingle()
  if (error) throw new Error('Unable to load the requested business.')
  return data
}

export async function listPipelineLeads(
  businessId: string,
): Promise<PipelineLead[]> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .select(
      'id, status, full_name, email, phone, service_request, vehicle_year, vehicle_make, vehicle_model, source, estimated_value_minor, won_value_minor, created_at',
    )
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Unable to load website requests.')

  return data.map((lead) => {
    const vehicleLabel = [
      lead.vehicle_year?.toString(),
      lead.vehicle_make,
      lead.vehicle_model,
    ]
      .filter(Boolean)
      .join(' ')
    return {
      id: lead.id,
      status: lead.status,
      fullName: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      serviceRequest: lead.service_request,
      vehicleLabel: vehicleLabel || null,
      source: lead.source,
      estimatedValueMinor: lead.estimated_value_minor,
      wonValueMinor: lead.won_value_minor,
      createdAt: lead.created_at,
    }
  })
}

export type LeadDetail = PipelineLead & {
  businessId: string
  message: string | null
  lossReason: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  consentText: string
  consentVersion: string
  consentedAt: string
  notes: Array<{ id: string; body: string; createdAt: string }>
  events: Array<{
    id: string
    eventType: string
    createdAt: string
    metadata: unknown
  }>
  deliveries: Array<{
    id: string
    provider: string
    recipientDisplay: string
    templateKey: string
    status: string
    createdAt: string
  }>
}

export async function getLeadDetail(
  businessId: string,
  leadId: string,
): Promise<LeadDetail | null> {
  await requireAuthenticatedUser()
  const supabase = await createClient()
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', leadId)
    .maybeSingle()
  if (error) throw new Error('Unable to load this website request.')
  if (!lead) return null

  const [{ data: notes }, { data: events }, { data: deliveries }] =
    await Promise.all([
      supabase
        .from('lead_notes')
        .select('id, body, created_at')
        .eq('business_id', businessId)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('lead_events')
        .select('id, event_type, metadata, created_at')
        .eq('business_id', businessId)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('message_deliveries')
        .select(
          'id, provider, recipient_display, template_key, status, created_at',
        )
        .eq('business_id', businessId)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
    ])

  const vehicleLabel = [
    lead.vehicle_year?.toString(),
    lead.vehicle_make,
    lead.vehicle_model,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    id: lead.id,
    businessId: lead.business_id,
    status: lead.status,
    fullName: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    serviceRequest: lead.service_request,
    vehicleLabel: vehicleLabel || null,
    source: lead.source,
    estimatedValueMinor: lead.estimated_value_minor,
    wonValueMinor: lead.won_value_minor,
    createdAt: lead.created_at,
    message: lead.message,
    lossReason: lead.loss_reason,
    utmSource: lead.utm_source,
    utmMedium: lead.utm_medium,
    utmCampaign: lead.utm_campaign,
    consentText: lead.consent_text,
    consentVersion: lead.consent_version,
    consentedAt: lead.consented_at,
    notes: (notes ?? []).map((note) => ({
      id: note.id,
      body: note.body,
      createdAt: note.created_at,
    })),
    events: (events ?? []).map((event) => ({
      id: event.id,
      eventType: event.event_type,
      createdAt: event.created_at,
      metadata: event.metadata,
    })),
    deliveries: (deliveries ?? []).map((delivery) => ({
      id: delivery.id,
      provider: delivery.provider,
      recipientDisplay: delivery.recipient_display,
      templateKey: delivery.template_key,
      status: delivery.status,
      createdAt: delivery.created_at,
    })),
  }
}
