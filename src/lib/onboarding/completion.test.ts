import { describe, expect, it } from 'vitest'
import { getOnboardingCompletion } from '@/lib/onboarding/completion'
import { emptyBusinessHours } from '@/lib/onboarding/hours'
import type { BusinessOnboarding } from '@/lib/onboarding/types'

function fixture(): BusinessOnboarding {
  return {
    business: {
      id: '11111111-1111-4111-8111-111111111111',
      name: '[DEMO] Test Auto',
      slug: 'demo-test-auto',
      category: 'general_automotive_repair',
      timezone: 'America/New_York',
      status: 'draft',
      factsApprovedAt: null,
      designApprovedAt: null,
    },
    profile: {
      publicPhone: null,
      publicEmail: null,
      websiteUrl: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      region: null,
      postalCode: null,
      countryCode: 'US',
      serviceArea: null,
      hours: emptyBusinessHours(),
      mapUrl: null,
      reviewUrl: null,
      primaryCta: null,
      valueProposition: null,
      approvedOffer: null,
      tone: null,
      contactPreference: null,
      factsSourceNotes: null,
    },
    brand: {
      logoAssetId: null,
      logoTreatment: null,
      primaryColor: '',
      accentColor: '',
      colorNotes: '',
      imagePermissionNotes: null,
      typographyDirection: null,
      shapeStyle: '',
      motionLevel: '',
      signatureFeature: null,
      designNotes: null,
    },
    services: [],
    assets: [],
    recipients: [],
    audit: [],
  }
}

describe('onboarding completion', () => {
  it('keeps incomplete or unknown facts visible', () => {
    const completion = getOnboardingCompletion(fixture())

    expect(completion.canApproveFacts).toBe(false)
    expect(completion.canActivate).toBe(false)
    expect(completion.factGaps).toContain('Public contact')
    expect(completion.factGaps).toContain('Fact sources recorded')
  })

  it('requires facts approval before design approval and both before activation', () => {
    const onboarding = fixture()
    onboarding.profile.publicPhone = '+1 555 010 1000'
    onboarding.profile.addressLine1 = '100 Demo Lane'
    onboarding.profile.city = 'Example City'
    onboarding.profile.region = 'NY'
    onboarding.profile.postalCode = '10001'
    onboarding.profile.hours.monday = { open: '08:00', close: '17:00' }
    onboarding.profile.primaryCta = 'Request a demo quote'
    onboarding.profile.valueProposition = '[DEMO] Fictional value proposition.'
    onboarding.profile.tone = 'Clear and practical'
    onboarding.profile.factsSourceNotes = '[DEMO] Fixture source notes.'
    onboarding.services.push({
      id: '11111111-1111-4111-8111-111111110001',
      name: 'Demo service',
      slug: 'demo-service',
      shortDescription: null,
      displayOrder: 0,
      isFeatured: false,
      isActive: true,
    })
    onboarding.brand.logoTreatment = '[DEMO] Wordmark'
    onboarding.brand.primaryColor = '#123b35'
    onboarding.brand.accentColor = '#d8f23f'
    onboarding.brand.typographyDirection = '[DEMO] Editorial sans'
    onboarding.brand.imagePermissionNotes = '[DEMO] Fixture rights.'
    onboarding.recipients.push({
      id: 'recipient',
      address: 'demo@example.com',
      verifiedAt: null,
    })

    expect(getOnboardingCompletion(onboarding).canApproveFacts).toBe(true)
    expect(getOnboardingCompletion(onboarding).canApproveDesign).toBe(false)

    onboarding.business.factsApprovedAt = new Date().toISOString()
    expect(getOnboardingCompletion(onboarding).canApproveDesign).toBe(true)
    expect(getOnboardingCompletion(onboarding).canActivate).toBe(false)

    onboarding.business.designApprovedAt = new Date().toISOString()
    expect(getOnboardingCompletion(onboarding).canActivate).toBe(true)
  })
})
