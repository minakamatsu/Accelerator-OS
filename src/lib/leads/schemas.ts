import { z } from 'zod'

export const leadStatuses = [
  'new',
  'contacted',
  'estimate_sent',
  'won',
  'lost',
] as const

export const leadStatusSchema = z.enum(leadStatuses)
export type LeadStatus = z.infer<typeof leadStatusSchema>

export const consentVersion = 'contact-request-v1-2026-08-15'

export function leadConsentText(businessName: string): string {
  return `By submitting this form, I agree that ${businessName} may contact me by phone call or email about this service request. This is not consent to marketing messages.`
}

const optionalTrimmed = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || null)

const optionalEmail = z
  .string()
  .trim()
  .max(320)
  .optional()
  .transform((value) => value?.toLowerCase() || null)
  .pipe(z.string().email({ error: 'Enter a valid email address.' }).nullable())

const optionalPhone = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((value) => value || null)
  .refine(
    (value) => !value || value.replace(/\D/g, '').length >= 7,
    'Enter a complete phone number.',
  )

const optionalYear = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : null))
  .refine(
    (value) =>
      value === null ||
      (Number.isInteger(value) && value >= 1886 && value <= 2200),
    'Enter a valid four-digit vehicle year.',
  )

export const publicLeadSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { error: 'Enter your full name.' })
      .max(160),
    email: optionalEmail,
    phone: optionalPhone,
    serviceSlug: optionalTrimmed(160),
    serviceRequest: z
      .string()
      .trim()
      .min(10, {
        error: 'Describe what changed using at least a few words.',
      })
      .max(2000),
    vehicleYear: optionalYear,
    vehicleMake: optionalTrimmed(80),
    vehicleModel: optionalTrimmed(80),
    message: optionalTrimmed(5000),
    consent: z.literal('on', {
      error: 'Confirm that the shop may contact you about this request.',
    }),
    idempotencyKey: z.string().uuid(),
    startedAt: z.coerce.number().int().positive(),
    companyWebsite: z.string().max(500).optional().default(''),
    turnstileToken: z.string().max(4096).optional().default(''),
    source: optionalTrimmed(120),
    utmSource: optionalTrimmed(200),
    utmMedium: optionalTrimmed(200),
    utmCampaign: optionalTrimmed(200),
    analyticsVisitorId: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null)
      .pipe(z.string().uuid().nullable()),
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'Enter an email address or phone number.',
    path: ['email'],
  })

const optionalMoney = z
  .string()
  .trim()
  .max(20)
  .optional()
  .transform((value) => (value ? Math.round(Number(value) * 100) : null))
  .refine(
    (value) => value === null || (Number.isSafeInteger(value) && value >= 0),
    'Enter a valid non-negative amount.',
  )

export const leadStatusMutationSchema = z
  .object({
    status: leadStatusSchema,
    lossReason: optionalTrimmed(500),
  })
  .refine((value) => value.status !== 'lost' || Boolean(value.lossReason), {
    message: 'Add a brief reason when marking a lead lost.',
    path: ['lossReason'],
  })

export const leadValueMutationSchema = z.object({
  estimatedValueMinor: optionalMoney,
  wonValueMinor: optionalMoney,
})

export const leadNoteSchema = z.object({
  body: z.string().trim().min(1).max(5000),
})

export type PublicLeadInput = z.infer<typeof publicLeadSchema>

export type FormActionState = {
  status: 'idle' | 'error' | 'success'
  message?: string
  fieldErrors?: Record<string, string[] | undefined>
}

export const initialFormActionState: FormActionState = { status: 'idle' }
