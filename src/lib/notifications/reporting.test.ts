import { describe, expect, it } from 'vitest'
import {
  calendarDateInTimeZone,
  filterNotificationReportItems,
  notificationCalendarDates,
  notificationRangeStart,
  parseNotificationReportingRange,
} from '@/lib/notifications/reporting'

describe('notification reporting', () => {
  it('accepts only the supported rolling ranges', () => {
    expect(parseNotificationReportingRange('24h')).toBe('24h')
    expect(parseNotificationReportingRange('30d')).toBe('30d')
    expect(parseNotificationReportingRange('90d')).toBe('7d')
    expect(parseNotificationReportingRange(undefined)).toBe('7d')
  })

  it('calculates an exact rolling range start', () => {
    const now = new Date('2026-08-17T16:00:00.000Z')
    expect(notificationRangeStart('24h', now)).toBe('2026-08-16T16:00:00.000Z')
    expect(notificationRangeStart('7d', now)).toBe('2026-08-10T16:00:00.000Z')
  })

  it('uses the selected business timezone for calendar-date filtering', () => {
    const createdAt = '2026-08-17T02:30:00.000Z'
    expect(calendarDateInTimeZone(createdAt, 'America/New_York')).toBe(
      '2026-08-16',
    )
    expect(calendarDateInTimeZone(createdAt, 'UTC')).toBe('2026-08-17')
  })

  it('filters a selected business log by partial customer name and date', () => {
    const items = [
      {
        id: 'one',
        customerName: 'Jordan Rivera',
        createdAt: '2026-08-17T15:00:00.000Z',
      },
      {
        id: 'two',
        customerName: 'Morgan Lee',
        createdAt: '2026-08-16T15:00:00.000Z',
      },
    ]

    expect(
      filterNotificationReportItems(items, {
        customerName: 'river',
        date: '2026-08-17',
        timeZone: 'America/New_York',
      }),
    ).toEqual([items[0]])
    expect(
      filterNotificationReportItems(items, {
        customerName: 'unknown',
        timeZone: 'America/New_York',
      }),
    ).toEqual([])
  })

  it('builds a date rail that covers every calendar date overlapping a range', () => {
    const now = new Date('2026-08-17T02:30:00.000Z')
    const dates = notificationCalendarDates('7d', 'America/New_York', now)

    expect(dates).toHaveLength(8)
    expect(dates[0]).toMatchObject({
      value: '2026-08-16',
      weekdayLabel: 'Today',
      dateLabel: 'Aug 16',
    })
    expect(dates[7].value).toBe('2026-08-09')
    expect(notificationCalendarDates('24h', 'UTC', now)).toHaveLength(2)
    expect(notificationCalendarDates('30d', 'UTC', now)).toHaveLength(31)
  })
})
