import { describe, expect, it } from 'vitest'
import {
  leadStatusMutationSchema,
  leadValueMutationSchema,
  publicLeadSchema,
} from '@/lib/leads/schemas'

const validPublicLead = {
  fullName: 'Jordan Driver',
  email: 'jordan@example.com',
  phone: '',
  serviceSlug: 'brake-safety-checks',
  serviceRequest: 'The brake pedal feels different than it did last week.',
  vehicleYear: '2020',
  vehicleMake: 'Demo',
  vehicleModel: 'Sedan',
  message: '',
  consent: 'on',
  idempotencyKey: '55555555-5555-4555-8555-555555555555',
  startedAt: '1000',
  companyWebsite: '',
  turnstileToken: '',
  source: 'website_quote',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
}

describe('lead schemas', () => {
  it('accepts a public request with one valid contact method', () => {
    const parsed = publicLeadSchema.parse(validPublicLead)
    expect(parsed.email).toBe('jordan@example.com')
    expect(parsed.phone).toBeNull()
    expect(parsed.vehicleYear).toBe(2020)
  })

  it('rejects a request without email or phone', () => {
    const result = publicLeadSchema.safeParse({
      ...validPublicLead,
      email: '',
      phone: '',
    })
    expect(result.success).toBe(false)
  })

  it('requires a reason for a lost lead', () => {
    const result = leadStatusMutationSchema.safeParse({
      status: 'lost',
      lossReason: '',
    })
    expect(result.success).toBe(false)
  })

  it('converts dollar inputs to integer minor units', () => {
    expect(
      leadValueMutationSchema.parse({
        estimatedValueMinor: '125.50',
        wonValueMinor: '100',
      }),
    ).toEqual({ estimatedValueMinor: 12550, wonValueMinor: 10000 })
  })
})
