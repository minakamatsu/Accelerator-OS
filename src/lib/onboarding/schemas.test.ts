import { describe, expect, it } from 'vitest'
import { validateBusinessHours } from '@/lib/onboarding/hours'
import {
  brandSchema,
  businessDraftSchema,
  businessProfileSchema,
} from '@/lib/onboarding/schemas'
import { emptyBusinessHours } from '@/lib/onboarding/hours'

describe('onboarding validation', () => {
  it('rejects unsafe URLs and malformed slugs', () => {
    expect(
      businessDraftSchema.safeParse({
        name: 'Demo Auto',
        slug: 'Demo Auto',
        timezone: 'America/New_York',
      }).success,
    ).toBe(false)

    const hours = emptyBusinessHours()
    expect(
      businessProfileSchema.safeParse({
        publicPhone: '',
        publicEmail: '',
        websiteUrl: 'http://example.com',
        addressLine1: '',
        addressLine2: '',
        city: '',
        region: '',
        postalCode: '',
        countryCode: 'US',
        serviceArea: '',
        mapUrl: '',
        reviewUrl: '',
        primaryCta: '',
        valueProposition: '',
        approvedOffer: '',
        tone: '',
        contactPreference: null,
        factsSourceNotes: '',
        hours,
      }).success,
    ).toBe(false)
  })

  it('rejects closing times that are not later than opening times', () => {
    const hours = emptyBusinessHours()
    hours.monday = { open: '17:00', close: '08:00' }
    expect(validateBusinessHours(hours)).toContain('closing time')
  })

  it('allows brand fields to remain blank while draft work is incomplete', () => {
    expect(
      brandSchema.safeParse({
        logoTreatment: '',
        primaryColor: '',
        accentColor: '',
        colorNotes: '',
        imagePermissionNotes: '',
        typographyDirection: '',
        shapeStyle: '',
        motionLevel: '',
        signatureFeature: '',
        designNotes: '',
      }).success,
    ).toBe(true)
  })
})
