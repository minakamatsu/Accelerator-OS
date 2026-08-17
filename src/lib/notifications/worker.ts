import 'server-only'
import { z } from 'zod'
import {
  businessRequestTemplate,
  renderBusinessRequestEmail,
} from '@/lib/notifications/business-request-email'
import { getEmailProvider } from '@/lib/providers/email'
import { createAdminClient } from '@/lib/supabase/admin'

const claimedJobSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  lead_id: z.string().uuid(),
  payload: z.unknown(),
  idempotency_key: z.string().min(1),
  attempt_count: z.number().int().positive(),
  lease_token: z.string().uuid(),
})

const recipientPayloadSchema = z.object({
  recipientId: z.string().uuid(),
})

export type NotificationWorkerResult = {
  claimed: number
  completed: number
  retrying: number
  failed: number
  canceled: number
}

function safeErrorCode(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('credentials are absent')) {
      return 'provider_not_configured'
    }
    if (error.message.includes('Resend delivery failed')) {
      return 'provider_request_failed'
    }
    if (error.message.includes('invalid response')) {
      return 'provider_response_invalid'
    }
  }
  return 'notification_processing_failed'
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return 'configured recipient'
  return `${local.slice(0, 1)}***@${domain}`
}

export async function processBusinessNotificationJobs({
  limit = 10,
  leadId,
  jobId,
}: {
  limit?: number
  leadId?: string
  jobId?: string
} = {}): Promise<NotificationWorkerResult> {
  const result: NotificationWorkerResult = {
    claimed: 0,
    completed: 0,
    retrying: 0,
    failed: 0,
    canceled: 0,
  }
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('claim_business_notification_jobs', {
    requested_limit: limit,
    requested_lead_id: leadId,
    requested_job_id: jobId,
  })
  if (error) throw new Error('Unable to claim notification work.')

  const parsedJobs = z.array(claimedJobSchema).safeParse(data ?? [])
  if (!parsedJobs.success) {
    throw new Error('Notification work returned an invalid claim.')
  }
  result.claimed = parsedJobs.data.length

  for (const job of parsedJobs.data) {
    try {
      const payload = recipientPayloadSchema.safeParse(job.payload)
      if (!payload.success) {
        await admin.rpc('cancel_business_notification_job', {
          requested_job_id: job.id,
          requested_lease_token: job.lease_token,
          requested_reason: 'invalid_notification_recipient',
        })
        result.canceled += 1
        continue
      }

      const [{ data: lead }, { data: business }, { data: recipient }] =
        await Promise.all([
          admin
            .from('leads')
            .select(
              'full_name, email, phone, service_request, vehicle_year, vehicle_make, vehicle_model, message, created_at',
            )
            .eq('business_id', job.business_id)
            .eq('id', job.lead_id)
            .maybeSingle(),
          admin
            .from('businesses')
            .select('name, timezone')
            .eq('id', job.business_id)
            .maybeSingle(),
          admin
            .from('notification_recipients')
            .select('recipient_address, enabled_event_kinds')
            .eq('business_id', job.business_id)
            .eq('id', payload.data.recipientId)
            .eq('recipient_type', 'email')
            .maybeSingle(),
        ])

      if (
        !lead ||
        !business ||
        !recipient ||
        !recipient.enabled_event_kinds.includes('lead.created')
      ) {
        await admin.rpc('cancel_business_notification_job', {
          requested_job_id: job.id,
          requested_lease_token: job.lease_token,
          requested_reason: 'notification_recipient_unavailable',
        })
        result.canceled += 1
        continue
      }

      const copy = renderBusinessRequestEmail({
        businessName: business.name,
        customerName: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        serviceRequest: lead.service_request ?? 'Not provided',
        vehicleYear: lead.vehicle_year,
        vehicleMake: lead.vehicle_make,
        vehicleModel: lead.vehicle_model,
        message: lead.message,
        submittedAt: lead.created_at,
        timezone: business.timezone,
      })
      const provider = getEmailProvider()
      const delivery = await provider.deliver({
        to: recipient.recipient_address,
        subject: copy.subject,
        text: copy.text,
        idempotencyKey: job.idempotency_key,
      })
      const { data: completed, error: completionError } = await admin.rpc(
        'complete_business_notification_job',
        {
          requested_job_id: job.id,
          requested_lease_token: job.lease_token,
          requested_provider: provider.name,
          requested_provider_message_id:
            delivery.outcome === 'sent' ? delivery.providerMessageId : '',
          requested_recipient_display: maskEmail(recipient.recipient_address),
          requested_template_key: businessRequestTemplate.key,
          requested_template_version: businessRequestTemplate.version,
          requested_delivery_status:
            delivery.outcome === 'sent' ? 'sent' : 'captured',
        },
      )
      if (completionError || !completed) {
        throw new Error('Notification completion was not recorded.')
      }
      result.completed += 1
    } catch (error) {
      const { data: status } = await admin.rpc(
        'fail_business_notification_job',
        {
          requested_job_id: job.id,
          requested_lease_token: job.lease_token,
          requested_error_code: safeErrorCode(error),
        },
      )
      if (status === 'failed') result.failed += 1
      else if (status === 'pending') result.retrying += 1
    }
  }

  return result
}
