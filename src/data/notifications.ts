import 'server-only'
import { requirePlatformAdmin } from '@/lib/auth/guards'
import { serverEnv } from '@/lib/env/server'
import {
  filterNotificationReportItems,
  notificationRangeStart,
  type NotificationReportCounts,
  type NotificationReportingRange,
  type NotificationReportStatus,
} from '@/lib/notifications/reporting'
import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationDeliveryItem = {
  id: string
  customerName: string
  recipientDisplay: string
  status: NotificationReportStatus
  attemptCount: number
  nextAttemptAt: string | null
  createdAt: string
  errorLabel: string | null
}

export type NotificationBusinessOption = {
  id: string
  name: string
  status: 'draft' | 'active' | 'suspended' | 'archived'
  timeZone: string
}

export type NotificationDeliveryReport = {
  providerMode: 'development' | 'resend'
  businesses: NotificationBusinessOption[]
  agencyCounts: NotificationReportCounts
  selectedBusiness: NotificationBusinessOption | null
  selectedCounts: NotificationReportCounts | null
  items: NotificationDeliveryItem[]
  businessSelectionInvalid: boolean
  logLimitReached: boolean
}

type AdminClient = ReturnType<typeof createAdminClient>

function payloadRecipientId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }
  const value = (payload as { recipientId?: unknown }).recipientId
  return typeof value === 'string' ? value : null
}

function maskEmail(email: string | undefined): string {
  if (!email) return 'Recipient no longer available'
  const [local, domain] = email.split('@')
  if (!local || !domain) return 'Configured recipient'
  return `${local.slice(0, 1)}***@${domain}`
}

function errorLabel(code: string | null): string | null {
  if (!code) return null
  const labels: Record<string, string> = {
    customer_automation_not_enabled: 'Customer automation is not enabled',
    invalid_notification_recipient: 'Notification recipient was invalid',
    notification_recipient_unavailable: 'Notification recipient was removed',
    notification_processing_failed: 'Processing was interrupted',
    provider_not_configured: 'Email provider is not configured',
    provider_request_failed: 'Email provider did not accept the request',
    provider_response_invalid: 'Email provider returned an invalid response',
    worker_lease_expired: 'A previous worker was interrupted',
  }
  return labels[code] ?? 'Delivery could not be completed'
}

async function getNotificationCounts(
  admin: AdminClient,
  since: string,
  businessId?: string,
): Promise<NotificationReportCounts> {
  const baseQuery = () => {
    let query = admin
      .from('outbox_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('kind', 'business_estimate_request_notification')
      .gte('created_at', since)
    if (businessId) query = query.eq('business_id', businessId)
    return query
  }

  const results = await Promise.all([
    baseQuery(),
    baseQuery().eq('status', 'sent'),
    baseQuery().in('status', ['pending', 'processing']),
    baseQuery().eq('status', 'canceled'),
    baseQuery().eq('status', 'failed'),
  ])
  if (results.some((result) => result.error)) {
    throw new Error('Unable to load notification totals.')
  }

  return {
    total: results[0].count ?? 0,
    processed: results[1].count ?? 0,
    waiting: results[2].count ?? 0,
    canceled: results[3].count ?? 0,
    needsAttention: results[4].count ?? 0,
  }
}

async function getNotificationItems(
  admin: AdminClient,
  business: NotificationBusinessOption,
  since: string,
  filters: { customerName?: string; date?: string },
): Promise<{ items: NotificationDeliveryItem[]; limitReached: boolean }> {
  const { data: jobs, error: jobsError } = await admin
    .from('outbox_jobs')
    .select(
      'id, lead_id, status, attempt_count, run_after, payload, last_error_code, created_at',
    )
    .eq('kind', 'business_estimate_request_notification')
    .eq('business_id', business.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(501)
  if (jobsError) throw new Error('Unable to load notification delivery work.')
  if (!jobs?.length) return { items: [], limitReached: false }

  const limitedJobs = jobs.slice(0, 500)
  const leadIds = jobs
    .map((job) => job.lead_id)
    .filter((leadId): leadId is string => Boolean(leadId))
  const jobIds = limitedJobs.map((job) => job.id)
  const [leadsResult, deliveriesResult, recipientsResult] = await Promise.all([
    leadIds.length
      ? admin.from('leads').select('id, full_name').in('id', leadIds)
      : Promise.resolve({ data: [], error: null }),
    admin
      .from('message_deliveries')
      .select('outbox_job_id, recipient_display, status')
      .in('outbox_job_id', jobIds),
    admin
      .from('notification_recipients')
      .select('id, recipient_address')
      .eq('business_id', business.id),
  ])
  if (leadsResult.error || deliveriesResult.error || recipientsResult.error) {
    throw new Error('Unable to load notification delivery details.')
  }

  const leadNames = new Map(
    (leadsResult.data ?? []).map((lead) => [lead.id, lead.full_name]),
  )
  const deliveryByJob = new Map(
    (deliveriesResult.data ?? []).map((delivery) => [
      delivery.outbox_job_id,
      delivery,
    ]),
  )
  const recipientAddresses = new Map(
    (recipientsResult.data ?? []).map((recipient) => [
      recipient.id,
      recipient.recipient_address,
    ]),
  )

  const items = limitedJobs.map((job): NotificationDeliveryItem => {
    const delivery = deliveryByJob.get(job.id)
    let status: NotificationReportStatus
    if (job.status === 'sent' && delivery?.status === 'captured') {
      status = 'captured'
    } else if (job.status === 'sent') {
      status = 'provider_accepted'
    } else if (job.status === 'pending' && job.attempt_count > 0) {
      status = 'retrying'
    } else if (job.status === 'pending') {
      status = 'queued'
    } else if (job.status === 'processing') {
      status = 'processing'
    } else if (job.status === 'canceled') {
      status = 'canceled'
    } else {
      status = 'failed'
    }

    const recipientId = payloadRecipientId(job.payload)
    return {
      id: job.id,
      customerName: job.lead_id
        ? (leadNames.get(job.lead_id) ?? 'Website visitor')
        : 'Website visitor',
      recipientDisplay:
        delivery?.recipient_display ??
        maskEmail(
          recipientId ? recipientAddresses.get(recipientId) : undefined,
        ),
      status,
      attemptCount: job.attempt_count,
      nextAttemptAt:
        status === 'queued' || status === 'retrying' ? job.run_after : null,
      createdAt: job.created_at,
      errorLabel: errorLabel(job.last_error_code),
    }
  })

  return {
    items: filterNotificationReportItems(items, {
      ...filters,
      timeZone: business.timeZone,
    }),
    limitReached: jobs.length > 500,
  }
}

export async function getNotificationDeliveryReport(options: {
  range: NotificationReportingRange
  businessId?: string
  customerName?: string
  date?: string
}): Promise<NotificationDeliveryReport> {
  await requirePlatformAdmin()
  const admin = createAdminClient()
  const since = notificationRangeStart(options.range)
  const [businessesResult, agencyCounts] = await Promise.all([
    admin.from('businesses').select('id, name, status, timezone').order('name'),
    getNotificationCounts(admin, since),
  ])
  if (businessesResult.error) {
    throw new Error('Unable to load the business list.')
  }

  const businesses = (businessesResult.data ?? []).map(
    (business): NotificationBusinessOption => ({
      id: business.id,
      name: business.name,
      status: business.status,
      timeZone: business.timezone,
    }),
  )
  const selectedBusiness = options.businessId
    ? (businesses.find((business) => business.id === options.businessId) ??
      null)
    : null

  if (!selectedBusiness) {
    return {
      providerMode: serverEnv.EMAIL_PROVIDER,
      businesses,
      agencyCounts,
      selectedBusiness: null,
      selectedCounts: null,
      items: [],
      businessSelectionInvalid: Boolean(options.businessId),
      logLimitReached: false,
    }
  }

  const [selectedCounts, itemReport] = await Promise.all([
    getNotificationCounts(admin, since, selectedBusiness.id),
    getNotificationItems(admin, selectedBusiness, since, {
      customerName: options.customerName,
      date: options.date,
    }),
  ])

  return {
    providerMode: serverEnv.EMAIL_PROVIDER,
    businesses,
    agencyCounts,
    selectedBusiness,
    selectedCounts,
    items: itemReport.items,
    businessSelectionInvalid: false,
    logLimitReached: itemReport.limitReached,
  }
}

export async function retryFailedNotification(jobId: string): Promise<boolean> {
  await requirePlatformAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('outbox_jobs')
    .update({
      status: 'pending',
      attempt_count: 0,
      run_after: new Date().toISOString(),
      lease_until: null,
      lease_token: null,
      last_error_code: null,
    })
    .eq('id', jobId)
    .eq('kind', 'business_estimate_request_notification')
    .eq('status', 'failed')
    .select('id')
    .maybeSingle()
  if (error) throw new Error('Unable to retry this notification.')
  return Boolean(data)
}
