import { describe, expect, it } from 'vitest'
import {
  analyticsDeviceType,
  analyticsReferrerHost,
  analyticsUtmSource,
  hashAnalyticsVisitor,
} from '@/lib/analytics/public-event'

describe('public analytics normalization', () => {
  it('creates a stable business-scoped one-way visitor identifier', () => {
    const visitorId = '1c093a6f-a47a-4f0d-bbf3-9eeac052de01'
    const atlas = hashAnalyticsVisitor('demo-atlas-auto', visitorId)

    expect(atlas).toMatch(/^[0-9a-f]{64}$/)
    expect(hashAnalyticsVisitor('demo-atlas-auto', visitorId)).toBe(atlas)
    expect(hashAnalyticsVisitor('another-business', visitorId)).not.toBe(atlas)
    expect(hashAnalyticsVisitor('demo-atlas-auto', 'not-an-id')).toBeNull()
  })

  it('derives plain device categories from viewport width', () => {
    expect(analyticsDeviceType(390)).toBe('mobile')
    expect(analyticsDeviceType(900)).toBe('tablet')
    expect(analyticsDeviceType(1440)).toBe('desktop')
    expect(analyticsDeviceType(0)).toBeNull()
  })

  it('stores only an external hostname and a bounded UTM source', () => {
    expect(
      analyticsReferrerHost(
        'https://www.google.com/search?q=mechanic',
        'atlas.localhost:3000',
      ),
    ).toBe('google.com')
    expect(
      analyticsReferrerHost(
        'http://atlas.localhost:3000/services',
        'atlas.localhost:3000',
      ),
    ).toBeNull()
    expect(analyticsUtmSource('  Facebook Campaign  ')).toBe(
      'facebook campaign',
    )
  })
})
