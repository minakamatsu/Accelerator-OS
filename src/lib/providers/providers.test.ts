import { describe, expect, it } from 'vitest'
import { developmentBillingProvider } from '@/lib/providers/billing'
import { developmentEmailProvider } from '@/lib/providers/email'

describe('development provider adapters', () => {
  it('labels email as captured instead of sent', async () => {
    const result = await developmentEmailProvider.deliver({
      to: 'lead@example.com',
      subject: 'Test',
      text: 'Test body',
      idempotencyKey: 'test-email-delivery',
    })

    expect(result.outcome).toBe('captured')
  })

  it('never produces a checkout URL', async () => {
    const result = await developmentBillingProvider.createHostedCheckout({
      businessId: 'test-business',
      planCode: 'test-plan',
      returnUrl: 'http://localhost:3000/admin',
    })

    expect(result.outcome).toBe('unavailable')
    expect(result).not.toHaveProperty('url')
  })
})
