export const analyticsRanges = [1, 7, 30, 90] as const

export type AnalyticsRange = (typeof analyticsRanges)[number]

export type AnalyticsEvent = {
  eventType: string
  createdAt: string
  anonymousVisitorHash?: string | null
  path?: string | null
  referrerHost?: string | null
  utmSource?: string | null
  deviceType?: string | null
}

export type AnalyticsRequest = { createdAt: string }

export type AnalyticsTrendPoint = {
  label: string
  pageViews: number
  uniqueVisitors: number
  highIntentActions: number
}

export type AnalyticsBreakdown = {
  label: string
  count: number
  percentage: number
  detail?: string
}

export type ClientDashboardMetrics = {
  days: AnalyticsRange
  rangeStart: string
  previousRangeStart: string
  pageViews: number
  uniqueVisitors: number
  previousUniqueVisitors: number
  visitorChangePercent: number | null
  estimateRequests: number
  phoneClicks: number
  directionsClicks: number
  contactClicks: number
  highIntentActions: number
  actionRate: number | null
  topPages: AnalyticsBreakdown[]
  trafficSources: AnalyticsBreakdown[]
  devices: AnalyticsBreakdown[]
  trend: AnalyticsTrendPoint[]
}

const hourInMilliseconds = 60 * 60 * 1000
const dayInMilliseconds = 24 * hourInMilliseconds

const highIntentEventTypes = new Set([
  'phone_click',
  'directions_click',
  'contact_click',
  'estimate_request',
])

export function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  const parsed = Number(value)
  return analyticsRanges.includes(parsed as AnalyticsRange)
    ? (parsed as AnalyticsRange)
    : 30
}

export function analyticsRangeLabel(range: AnalyticsRange): string {
  return range === 1 ? '24 hours' : `${range} days`
}

export function analyticsRangeStart(
  days: AnalyticsRange,
  now = new Date(),
): Date {
  if (days === 1) {
    return new Date(now.getTime() - dayInMilliseconds)
  }
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  start.setUTCDate(start.getUTCDate() - (days - 1))
  return start
}

export function analyticsPreviousRangeStart(
  days: AnalyticsRange,
  now = new Date(),
): Date {
  const start = analyticsRangeStart(days, now)
  if (days === 1) {
    return new Date(start.getTime() - dayInMilliseconds)
  }
  start.setUTCDate(start.getUTCDate() - days)
  return start
}

function bucketSize(days: AnalyticsRange) {
  if (days === 1) return 1
  if (days === 7) return 1
  if (days === 30) return 3
  return 7
}

function rollingDayTrendLabel(index: number): string {
  if (index === 5) return 'Last 4h'
  const startHoursAgo = 24 - index * 4
  return `${startHoursAgo}–${startHoursAgo - 4}h ago`
}

function dayDifference(start: Date, value: Date): number {
  const utcValue = Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  )
  return Math.floor((utcValue - start.getTime()) / 86_400_000)
}

function dateLabel(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  if (start.getTime() === end.getTime()) return formatter.format(start)
  return `${formatter.format(start)}–${formatter.format(end)}`
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10
}

function humanize(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function analyticsPageLabel(path: string): string {
  const pathname = path.split('?')[0] ?? path
  const sitePath = pathname.replace(/^\/site\/[^/]+/, '') || '/'
  if (sitePath === '/') return 'Home'
  if (sitePath === '/services') return 'Services'
  if (sitePath === '/vehicle-concerns') return 'Vehicle concerns'
  if (sitePath === '/visit') return 'Hours & location'
  if (sitePath === '/quote') return 'Request service'
  if (sitePath.startsWith('/services/')) {
    return `${humanize(sitePath.slice('/services/'.length))} service`
  }
  return humanize(sitePath.replace(/^\//, ''))
}

export function analyticsTrafficSource(
  utmSource: string | null | undefined,
  referrerHost: string | null | undefined,
): string {
  const value = (utmSource || referrerHost || '').trim().toLowerCase()
  if (!value || value === 'direct') return 'Direct'
  if (value.includes('google')) return 'Google'
  if (value.includes('facebook') || value === 'fb' || value.includes('meta')) {
    return 'Facebook'
  }
  if (value.includes('instagram')) return 'Instagram'
  if (value.includes('bing')) return 'Bing'
  if (value.includes('yelp')) return 'Yelp'
  return referrerHost && !utmSource ? referrerHost : humanize(value)
}

function sortedBreakdown(
  values: Map<string, number>,
  total: number,
  detail?: (label: string) => string | undefined,
): AnalyticsBreakdown[] {
  return [...values.entries()]
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      percentage: percentage(count, total),
      detail: detail?.(label),
    }))
}

export function buildClientDashboardMetrics({
  days,
  events,
  requests,
  now = new Date(),
}: {
  days: AnalyticsRange
  events: AnalyticsEvent[]
  requests: AnalyticsRequest[]
  now?: Date
}): ClientDashboardMetrics {
  const start = analyticsRangeStart(days, now)
  const previousStart = analyticsPreviousRangeStart(days, now)
  const size = bucketSize(days)
  const bucketCount = days === 1 ? 6 : Math.ceil(days / size)
  const trendVisitorSets = Array.from(
    { length: bucketCount },
    () => new Set<string>(),
  )
  const trend = Array.from({ length: bucketCount }, (_, index) => {
    if (days === 1) {
      return {
        label: rollingDayTrendLabel(index),
        pageViews: 0,
        uniqueVisitors: 0,
        highIntentActions: 0,
      }
    }
    const bucketStart = new Date(start)
    bucketStart.setUTCDate(start.getUTCDate() + index * size)
    const bucketEnd = new Date(start)
    bucketEnd.setUTCDate(
      start.getUTCDate() + Math.min(index * size + size - 1, days - 1),
    )
    return {
      label: dateLabel(bucketStart, bucketEnd),
      pageViews: 0,
      uniqueVisitors: 0,
      highIntentActions: 0,
    }
  })

  let pageViews = 0
  let phoneClicks = 0
  let directionsClicks = 0
  let contactClicks = 0
  let estimateRequests = 0
  const visitors = new Set<string>()
  const previousVisitors = new Set<string>()
  const actionVisitors = new Set<string>()
  const pageCounts = new Map<string, number>()
  const visitorSources = new Map<string, string>()
  const visitorDevices = new Map<string, string>()

  const orderedEvents = [...events].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  )
  const startTime = start.getTime()
  const previousStartTime = previousStart.getTime()
  const nowTime = now.getTime()
  const pointIndexFor = (value: Date): number => {
    if (days === 1) {
      return Math.min(
        bucketCount - 1,
        Math.floor((value.getTime() - startTime) / (4 * hourInMilliseconds)),
      )
    }
    return Math.floor(dayDifference(start, value) / size)
  }

  for (const event of orderedEvents) {
    const createdAt = new Date(event.createdAt)
    const createdAtTime = createdAt.getTime()
    const hash = event.anonymousVisitorHash || null

    if (createdAtTime >= previousStartTime && createdAtTime < startTime) {
      if (event.eventType === 'page_view' && hash) previousVisitors.add(hash)
      continue
    }
    if (createdAtTime < startTime || createdAtTime > nowTime) continue

    const pointIndex = pointIndexFor(createdAt)
    const point = trend[pointIndex]
    if (!point) continue

    if (event.eventType === 'page_view') {
      pageViews += 1
      point.pageViews += 1
      const path = event.path || '/'
      pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1)

      if (hash) {
        visitors.add(hash)
        trendVisitorSets[pointIndex]?.add(hash)
        if (!visitorSources.has(hash)) {
          visitorSources.set(
            hash,
            analyticsTrafficSource(event.utmSource, event.referrerHost),
          )
        }
        if (!visitorDevices.has(hash) && event.deviceType) {
          visitorDevices.set(hash, event.deviceType)
        }
      }
    } else if (event.eventType === 'phone_click') {
      phoneClicks += 1
      point.highIntentActions += 1
    } else if (event.eventType === 'directions_click') {
      directionsClicks += 1
      point.highIntentActions += 1
    } else if (event.eventType === 'contact_click') {
      contactClicks += 1
      point.highIntentActions += 1
    }

    if (hash && highIntentEventTypes.has(event.eventType)) {
      actionVisitors.add(hash)
    }
  }

  for (const request of requests) {
    const createdAt = new Date(request.createdAt)
    const createdAtTime = createdAt.getTime()
    if (createdAtTime < startTime || createdAtTime > nowTime) continue
    const point = trend[pointIndexFor(createdAt)]
    if (!point) continue
    estimateRequests += 1
    point.highIntentActions += 1
  }

  trend.forEach((point, index) => {
    point.uniqueVisitors = trendVisitorSets[index]?.size ?? 0
  })

  const identifiedActionVisitors = [...actionVisitors].filter((hash) =>
    visitors.has(hash),
  ).length
  const sourceCounts = new Map<string, number>()
  visitorSources.forEach((source) => {
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  })
  const deviceCounts = new Map<string, number>()
  visitorDevices.forEach((device) => {
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1)
  })

  const uniqueVisitors = visitors.size
  const previousUniqueVisitors = previousVisitors.size
  const visitorChangePercent =
    previousUniqueVisitors === 0
      ? null
      : Math.round(
          ((uniqueVisitors - previousUniqueVisitors) / previousUniqueVisitors) *
            1000,
        ) / 10

  return {
    days,
    rangeStart: start.toISOString(),
    previousRangeStart: previousStart.toISOString(),
    pageViews,
    uniqueVisitors,
    previousUniqueVisitors,
    visitorChangePercent,
    estimateRequests,
    phoneClicks,
    directionsClicks,
    contactClicks,
    highIntentActions:
      estimateRequests + phoneClicks + directionsClicks + contactClicks,
    actionRate:
      uniqueVisitors === 0
        ? null
        : Math.round((identifiedActionVisitors / uniqueVisitors) * 1000) / 10,
    topPages: sortedBreakdown(pageCounts, pageViews, (path) => path).map(
      (page) => ({ ...page, label: analyticsPageLabel(page.label) }),
    ),
    trafficSources: sortedBreakdown(sourceCounts, uniqueVisitors),
    devices: sortedBreakdown(deviceCounts, uniqueVisitors, (device) => {
      if (device === 'mobile') return 'Phones and narrow screens'
      if (device === 'tablet') return 'Tablet-sized screens'
      if (device === 'desktop') return 'Laptops and desktop screens'
      return undefined
    })
      .map((device) => ({ ...device, label: humanize(device.label) }))
      .sort((left, right) => {
        const order = ['Mobile', 'Desktop', 'Tablet']
        return order.indexOf(left.label) - order.indexOf(right.label)
      }),
    trend,
  }
}
