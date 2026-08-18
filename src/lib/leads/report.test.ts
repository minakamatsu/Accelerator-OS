import { describe, expect, it } from 'vitest'
import {
  buildWebsiteLeadTrend,
  filterWebsiteLeadReportItems,
  type WebsiteLeadReportItem,
} from '@/lib/leads/report'

const leads: WebsiteLeadReportItem[] = [
  {
    id: 'one',
    fullName: 'Jordan Rivera',
    email: 'jordan@example.com',
    phone: '555-0101',
    serviceRequest: 'Grinding sound while braking',
    message: 'Mostly on the highway',
    vehicleLabel: '2018 Toyota Camry',
    createdAt: '2026-08-17T15:00:00.000Z',
  },
  {
    id: 'two',
    fullName: 'Morgan Lee',
    email: null,
    phone: '555-0102',
    serviceRequest: 'Oil leak under the vehicle',
    message: null,
    vehicleLabel: '2014 Honda Accord',
    createdAt: '2026-08-16T02:30:00.000Z',
  },
]

describe('website lead report', () => {
  it('searches across customer, contact, vehicle, and request details', () => {
    const filters = { timeZone: 'America/New_York' }

    expect(
      filterWebsiteLeadReportItems(leads, { ...filters, query: 'CAMRY' }),
    ).toEqual([leads[0]])
    expect(
      filterWebsiteLeadReportItems(leads, { ...filters, query: 'oil leak' }),
    ).toEqual([leads[1]])
    expect(
      filterWebsiteLeadReportItems(leads, { ...filters, query: '555-0101' }),
    ).toEqual([leads[0]])
  })

  it('filters calendar dates in the business reporting timezone', () => {
    expect(
      filterWebsiteLeadReportItems(leads, {
        date: '2026-08-15',
        timeZone: 'America/New_York',
      }),
    ).toEqual([leads[1]])
    expect(
      filterWebsiteLeadReportItems(leads, {
        date: '2026-08-16',
        timeZone: 'UTC',
      }),
    ).toEqual([leads[1]])
  })

  it('builds accessible lead-volume buckets for the selected period', () => {
    const trend = buildWebsiteLeadTrend(
      leads,
      30,
      new Date('2026-08-18T12:00:00.000Z'),
    )

    expect(trend).toHaveLength(10)
    expect(trend.reduce((total, point) => total + point.count, 0)).toBe(2)
    expect(trend[0]?.label).toContain('–')
    expect(trend[0]?.axisLabel).not.toContain('–')
  })

  it('uses absolute local times on the 24-hour axis and detailed ranges on hover', () => {
    const trend = buildWebsiteLeadTrend(
      leads,
      1,
      new Date('2026-08-18T12:00:00.000Z'),
      'America/New_York',
    )

    expect(trend).toHaveLength(6)
    expect(trend[0]).toMatchObject({
      label: 'Aug 17, 8 AM–12 PM',
      axisLabel: '8 AM',
    })
    expect(trend.at(-1)?.axisLabel).toBe('Now')
    expect(trend.every((point) => !point.axisLabel.includes('ago'))).toBe(true)
  })
})
