import { describe, expect, it } from 'vitest'
import {
  analyticsPageLabel,
  analyticsPreviousRangeStart,
  analyticsRangeStart,
  analyticsTrafficSource,
  buildClientDashboardMetrics,
  parseAnalyticsRange,
} from '@/lib/analytics/dashboard'

const now = new Date('2026-08-15T18:00:00.000Z')

describe('client dashboard analytics', () => {
  it('uses a safe 30-day default and accepts only supported ranges', () => {
    expect(parseAnalyticsRange(undefined)).toBe(30)
    expect(parseAnalyticsRange('1')).toBe(1)
    expect(parseAnalyticsRange('7')).toBe(7)
    expect(parseAnalyticsRange('90')).toBe(90)
    expect(parseAnalyticsRange('365')).toBe(30)
  })

  it('builds adjacent inclusive current and previous ranges', () => {
    expect(analyticsRangeStart(1, now).toISOString()).toBe(
      '2026-08-14T18:00:00.000Z',
    )
    expect(analyticsPreviousRangeStart(1, now).toISOString()).toBe(
      '2026-08-13T18:00:00.000Z',
    )
    expect(analyticsRangeStart(7, now).toISOString()).toBe(
      '2026-08-09T00:00:00.000Z',
    )
    expect(analyticsPreviousRangeStart(7, now).toISOString()).toBe(
      '2026-08-02T00:00:00.000Z',
    )
  })

  it('uses an exact rolling 24-hour window with six four-hour trend buckets', () => {
    const metrics = buildClientDashboardMetrics({
      days: 1,
      now,
      events: [
        {
          eventType: 'page_view',
          createdAt: '2026-08-14T17:59:59.000Z',
          anonymousVisitorHash: 'previous-visitor',
        },
        {
          eventType: 'page_view',
          createdAt: '2026-08-14T18:00:00.000Z',
          anonymousVisitorHash: 'current-visitor',
        },
        {
          eventType: 'phone_click',
          createdAt: '2026-08-15T17:59:00.000Z',
          anonymousVisitorHash: 'current-visitor',
        },
      ],
      requests: [{ createdAt: '2026-08-15T17:00:00.000Z' }],
    })

    expect(metrics.uniqueVisitors).toBe(1)
    expect(metrics.previousUniqueVisitors).toBe(1)
    expect(metrics.pageViews).toBe(1)
    expect(metrics.phoneClicks).toBe(1)
    expect(metrics.estimateRequests).toBe(1)
    expect(metrics.trend).toHaveLength(6)
    expect(metrics.trend[0]?.label).toBe('24–20h ago')
    expect(metrics.trend[5]?.label).toBe('Last 4h')
  })

  it('reconciles visitors, sources, devices, actions, and comparisons', () => {
    const metrics = buildClientDashboardMetrics({
      days: 7,
      now,
      events: [
        {
          eventType: 'page_view',
          createdAt: '2026-08-15T10:00:00.000Z',
          anonymousVisitorHash: 'visitor-a',
          path: '/site/demo-atlas-auto',
          referrerHost: 'google.com',
          deviceType: 'mobile',
        },
        {
          eventType: 'page_view',
          createdAt: '2026-08-15T10:05:00.000Z',
          anonymousVisitorHash: 'visitor-a',
          path: '/site/demo-atlas-auto/services',
          referrerHost: 'google.com',
          deviceType: 'mobile',
        },
        {
          eventType: 'page_view',
          createdAt: '2026-08-14T10:00:00.000Z',
          anonymousVisitorHash: 'visitor-b',
          path: '/site/demo-atlas-auto/services',
          utmSource: 'facebook',
          deviceType: 'desktop',
        },
        {
          eventType: 'phone_click',
          createdAt: '2026-08-14T11:00:00.000Z',
          anonymousVisitorHash: 'visitor-a',
        },
        {
          eventType: 'directions_click',
          createdAt: '2026-08-14T12:00:00.000Z',
          anonymousVisitorHash: 'visitor-b',
        },
        {
          eventType: 'estimate_request',
          createdAt: '2026-08-15T12:00:00.000Z',
          anonymousVisitorHash: 'visitor-a',
        },
        {
          eventType: 'page_view',
          createdAt: '2026-08-08T10:00:00.000Z',
          anonymousVisitorHash: 'previous-a',
        },
      ],
      requests: [{ createdAt: '2026-08-15T12:00:00.000Z' }],
    })

    expect(metrics.pageViews).toBe(3)
    expect(metrics.uniqueVisitors).toBe(2)
    expect(metrics.previousUniqueVisitors).toBe(1)
    expect(metrics.visitorChangePercent).toBe(100)
    expect(metrics.estimateRequests).toBe(1)
    expect(metrics.phoneClicks).toBe(1)
    expect(metrics.directionsClicks).toBe(1)
    expect(metrics.highIntentActions).toBe(3)
    expect(metrics.actionRate).toBe(100)
    expect(metrics.topPages[0]).toMatchObject({
      label: 'Services',
      count: 2,
    })
    expect(metrics.trafficSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Google', count: 1 }),
        expect.objectContaining({ label: 'Facebook', count: 1 }),
      ]),
    )
    expect(metrics.devices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Mobile', count: 1 }),
        expect.objectContaining({ label: 'Desktop', count: 1 }),
      ]),
    )
    expect(metrics.devices[0]?.label).toBe('Mobile')
    expect(metrics.trend).toHaveLength(7)
  })

  it('keeps comparison and action rate honest without identified visitors', () => {
    const metrics = buildClientDashboardMetrics({
      days: 30,
      now,
      events: [],
      requests: [{ createdAt: '2026-08-15T12:00:00.000Z' }],
    })

    expect(metrics.visitorChangePercent).toBeNull()
    expect(metrics.actionRate).toBeNull()
  })

  it('uses business-friendly page and source labels', () => {
    expect(
      analyticsPageLabel('/site/demo-atlas-auto/services/brake-repair'),
    ).toBe('Brake Repair service')
    expect(analyticsTrafficSource(null, null)).toBe('Direct')
    expect(analyticsTrafficSource('paid_google', null)).toBe('Google')
    expect(analyticsTrafficSource(null, 'local-directory.example')).toBe(
      'local-directory.example',
    )
  })
})
