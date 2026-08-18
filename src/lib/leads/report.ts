import {
  analyticsRangeStart,
  buildClientDashboardMetrics,
  type AnalyticsRange,
} from '@/lib/analytics/dashboard'
import { calendarDateInTimeZone } from '@/lib/notifications/reporting'

export type WebsiteLeadReportItem = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  serviceRequest: string
  message: string | null
  vehicleLabel: string | null
  createdAt: string
}

export type WebsiteLeadTrendPoint = {
  label: string
  axisLabel: string
  count: number
}

const fourHoursInMilliseconds = 4 * 60 * 60 * 1000

function formatHour(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone,
  }).format(value)
}

function formatDateAndHour(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    timeZone,
  }).format(value)
}

function rollingBucketLabel(start: Date, end: Date, timeZone: string): string {
  const startLabel = formatDateAndHour(start, timeZone)
  const endLabel =
    calendarDateInTimeZone(start.toISOString(), timeZone) ===
    calendarDateInTimeZone(end.toISOString(), timeZone)
      ? formatHour(end, timeZone)
      : formatDateAndHour(end, timeZone)

  return `${startLabel}–${endLabel}`
}

export function websiteLeadRangeStart(
  days: AnalyticsRange,
  now = new Date(),
): string {
  return analyticsRangeStart(days, now).toISOString()
}

export function buildWebsiteLeadTrend(
  leads: Pick<WebsiteLeadReportItem, 'createdAt'>[],
  days: AnalyticsRange,
  now = new Date(),
  timeZone = 'UTC',
): WebsiteLeadTrendPoint[] {
  const metrics = buildClientDashboardMetrics({
    days,
    events: [],
    requests: leads,
    now,
  })

  const rangeStart = analyticsRangeStart(days, now)

  return metrics.trend.map((point, index) => {
    if (days !== 1) {
      return {
        label: point.label,
        axisLabel: point.label.split('–')[0] ?? point.label,
        count: point.highIntentActions,
      }
    }

    const bucketStart = new Date(
      rangeStart.getTime() + index * fourHoursInMilliseconds,
    )
    const bucketEnd = new Date(
      Math.min(bucketStart.getTime() + fourHoursInMilliseconds, now.getTime()),
    )

    return {
      label: rollingBucketLabel(bucketStart, bucketEnd, timeZone),
      axisLabel:
        index === metrics.trend.length - 1
          ? 'Now'
          : formatHour(bucketStart, timeZone),
      count: point.highIntentActions,
    }
  })
}

export function filterWebsiteLeadReportItems(
  leads: WebsiteLeadReportItem[],
  filters: { query?: string; date?: string; timeZone: string },
): WebsiteLeadReportItem[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(filters.date ?? '')
    ? filters.date
    : undefined

  return leads.filter((lead) => {
    const searchText = [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.vehicleLabel,
      lead.serviceRequest,
      lead.message,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()

    return (
      (!query || searchText.includes(query)) &&
      (!date ||
        calendarDateInTimeZone(lead.createdAt, filters.timeZone) === date)
    )
  })
}
