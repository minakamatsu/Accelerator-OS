'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { after } from 'next/server'
import {
  getPublicSiteBySlug,
  recordPublicEstimateRequest,
  resolvePublicSiteSlugByHostname,
} from '@/data/public-site'
import { capturePublicLead } from '@/data/leads'
import {
  consentVersion,
  leadConsentText,
  publicLeadSchema,
  type FormActionState,
} from '@/lib/leads/schemas'
import { getSpamProvider } from '@/lib/providers/spam'
import {
  isPlatformHostname,
  isPublicSiteSlug,
  normalizeHostname,
} from '@/lib/public-site/tenant'
import { processBusinessNotificationJobs } from '@/lib/notifications/worker'

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

function requestFingerprint(
  slug: string,
  remoteIp: string | null,
  userAgent: string,
): string {
  return createHash('sha256')
    .update(`${slug}\n${remoteIp ?? 'unknown'}\n${userAgent}`)
    .digest('hex')
}

export async function submitPublicQuote(
  expectedSlug: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  if (!isPublicSiteSlug(expectedSlug)) {
    return { status: 'error', message: 'This request form is unavailable.' }
  }

  const parsed = publicLeadSchema.safeParse({
    fullName: formValue(formData, 'fullName'),
    email: formValue(formData, 'email'),
    phone: formValue(formData, 'phone'),
    serviceSlug: formValue(formData, 'serviceSlug'),
    serviceRequest: formValue(formData, 'serviceRequest'),
    vehicleYear: formValue(formData, 'vehicleYear'),
    vehicleMake: formValue(formData, 'vehicleMake'),
    vehicleModel: formValue(formData, 'vehicleModel'),
    message: formValue(formData, 'message'),
    consent: formValue(formData, 'consent'),
    idempotencyKey: formValue(formData, 'idempotencyKey'),
    startedAt: formValue(formData, 'startedAt'),
    companyWebsite: formValue(formData, 'companyWebsite'),
    turnstileToken: formValue(formData, 'turnstileToken'),
    source: formValue(formData, 'source'),
    utmSource: formValue(formData, 'utmSource'),
    utmMedium: formValue(formData, 'utmMedium'),
    utmCampaign: formValue(formData, 'utmCampaign'),
    analyticsVisitorId: formValue(formData, 'analyticsVisitorId'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Review the highlighted details and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const requestHeaders = await headers()
  const hostname = normalizeHostname(requestHeaders.get('host'))
  if (!hostname) {
    return { status: 'error', message: 'This request form is unavailable.' }
  }

  const origin = requestHeaders.get('origin')
  if (origin) {
    try {
      if (normalizeHostname(new URL(origin).host) !== hostname) {
        return { status: 'error', message: 'This request form is unavailable.' }
      }
    } catch {
      return { status: 'error', message: 'This request form is unavailable.' }
    }
  }

  const platformRootDomain = process.env.PLATFORM_ROOT_DOMAIN ?? 'localhost'
  if (!isPlatformHostname(hostname, platformRootDomain)) {
    const hostSlug = await resolvePublicSiteSlugByHostname(hostname)
    if (hostSlug !== expectedSlug) {
      return { status: 'error', message: 'This request form is unavailable.' }
    }
  }

  const site = await getPublicSiteBySlug(expectedSlug)
  if (!site) {
    return { status: 'error', message: 'This request form is unavailable.' }
  }

  const remoteIp =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const spam = await getSpamProvider().verify({
    honeypot: parsed.data.companyWebsite,
    startedAt: parsed.data.startedAt,
    token: parsed.data.turnstileToken,
    remoteIp,
  })
  if (spam.outcome === 'rejected') {
    return {
      status: 'error',
      message:
        'We could not verify this request. Please wait a moment and try again, or call the shop directly.',
    }
  }

  try {
    const { analyticsVisitorId, ...leadData } = parsed.data
    const result = await capturePublicLead({
      ...leadData,
      slug: expectedSlug,
      fingerprintHash: requestFingerprint(
        expectedSlug,
        remoteIp,
        requestHeaders.get('user-agent') ?? 'unknown',
      ),
      consentText: leadConsentText(site.name),
      consentVersion,
    })
    if (!result.accepted || !result.leadId) {
      return { status: 'error', message: 'This request form is unavailable.' }
    }

    if (!result.duplicate) {
      await recordPublicEstimateRequest(
        expectedSlug,
        `/site/${expectedSlug}/quote`,
        { visitorId: analyticsVisitorId },
      )
    }

    after(async () => {
      try {
        await processBusinessNotificationJobs({ leadId: result.leadId })
      } catch {
        // The durable outbox keeps the job available for the scheduled worker.
      }
    })
    return {
      status: 'success',
      message: result.duplicate
        ? 'Your request was already received. There is no need to submit it again.'
        : 'Your request is in. The shop can now review the details and follow up using the contact information you provided.',
    }
  } catch {
    return {
      status: 'error',
      message:
        'We could not accept the request right now. Please wait a moment and try again, or call the shop directly.',
    }
  }
}
