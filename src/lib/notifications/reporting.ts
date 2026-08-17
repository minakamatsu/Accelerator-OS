export const notificationReportingRanges = ['24h', '7d', '30d'] as const

export type NotificationReportingRange =
  (typeof notificationReportingRanges)[number]

export type NotificationReportStatus =
  | 'queued'
  | 'retrying'
  | 'processing'
  | 'captured'
  | 'provider_accepted'
  | 'canceled'
  | 'failed'

export type NotificationReportCounts = {
  total: number
  processed: number
  waiting: number
  canceled: number
  needsAttention: number
}

export type NotificationCalendarDate = {
  value: string
  weekdayLabel: string
  dateLabel: string
  accessibleLabel: string
}

export function parseNotificationReportingRange(
  value: string | undefined,
): NotificationReportingRange {
  return notificationReportingRanges.includes(
    value as NotificationReportingRange,
  )
    ? (value as NotificationReportingRange)
    : '7d'
}

export function notificationRangeStart(
  range: NotificationReportingRange,
  now = new Date(),
): string {
  const hours = range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
}

export function calendarDateInTimeZone(
  value: string,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const values = new Map(parts.map((part) => [part.type, part.value]))
  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`
}

export function notificationCalendarDates(
  range: NotificationReportingRange,
  timeZone: string,
  now = new Date(),
): NotificationCalendarDate[] {
  const currentDate = calendarDateInTimeZone(now.toISOString(), timeZone)
  const currentDay = new Date(`${currentDate}T12:00:00.000Z`)
  const numberOfDates = range === '24h' ? 2 : range === '7d' ? 8 : 31

  return Array.from({ length: numberOfDates }, (_, index) => {
    const day = new Date(currentDay.getTime() - index * 24 * 60 * 60 * 1000)
    const value = day.toISOString().slice(0, 10)
    return {
      value,
      weekdayLabel:
        index === 0
          ? 'Today'
          : index === 1
            ? 'Yesterday'
            : new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                timeZone: 'UTC',
              }).format(day),
      dateLabel: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(day),
      accessibleLabel: new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(day),
    }
  })
}

export function filterNotificationReportItems<
  T extends { customerName: string; createdAt: string },
>(
  items: T[],
  filters: { customerName?: string; date?: string; timeZone: string },
): T[] {
  const customerName = filters.customerName?.trim().toLocaleLowerCase() ?? ''
  const date = filters.date?.trim() ?? ''

  return items.filter((item) => {
    const matchesName =
      !customerName ||
      item.customerName.toLocaleLowerCase().includes(customerName)
    const matchesDate =
      !date || calendarDateInTimeZone(item.createdAt, filters.timeZone) === date
    return matchesName && matchesDate
  })
}
