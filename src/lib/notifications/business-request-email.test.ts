import { describe, expect, it } from 'vitest'
import {
  businessRequestTemplate,
  renderBusinessRequestEmail,
} from '@/lib/notifications/business-request-email'

describe('business estimate-request email', () => {
  it('includes the contact and vehicle details needed by the shop', () => {
    const email = renderBusinessRequestEmail({
      businessName: 'Demo Auto Repair',
      customerName: 'Jordan Example',
      email: 'jordan@example.com',
      phone: '555-010-2000',
      serviceRequest: 'Brake inspection',
      vehicleYear: 2020,
      vehicleMake: 'Demo',
      vehicleModel: 'Sedan',
      message: 'Grinding sound when stopping.',
      submittedAt: '2026-08-17T13:30:00.000Z',
      timezone: 'America/New_York',
    })

    expect(email.subject).toBe(
      'New website estimate request from Jordan Example',
    )
    expect(email.text).toContain('Phone: 555-010-2000')
    expect(email.text).toContain('Email: jordan@example.com')
    expect(email.text).toContain('Vehicle: 2020 Demo Sedan')
    expect(email.text).toContain('Requested help: Brake inspection')
    expect(email.text).toContain('no price was generated automatically')
    expect(businessRequestTemplate).toEqual({
      key: 'business_estimate_request',
      version: 'v1',
    })
  })

  it('labels missing optional details without inventing information', () => {
    const email = renderBusinessRequestEmail({
      businessName: 'Demo Auto Repair',
      customerName: 'Jordan Example',
      email: null,
      phone: '555-010-2000',
      serviceRequest: 'Unusual engine noise',
      vehicleYear: null,
      vehicleMake: null,
      vehicleModel: null,
      message: null,
      submittedAt: '2026-08-17T13:30:00.000Z',
      timezone: 'Invalid/Timezone',
    })

    expect(email.text).toContain('Vehicle: Not provided')
    expect(email.text).toContain('Email: Not provided')
    expect(email.text).toContain('Additional details: Not provided')
  })
})
