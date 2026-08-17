import 'server-only'
import { createHash } from 'node:crypto'

const visitorIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const hostnamePattern = /^[a-z0-9.-]+$/

export type AnalyticsDeviceType = 'mobile' | 'tablet' | 'desktop'

export function hashAnalyticsVisitor(
  businessSlug: string,
  visitorId: string | null | undefined,
): string | null {
  const normalized = visitorId?.trim().toLowerCase()
  if (!normalized || !visitorIdPattern.test(normalized)) return null

  return createHash('sha256')
    .update(`${businessSlug}\0${normalized}`)
    .digest('hex')
}

export function analyticsDeviceType(
  viewportWidth: number | null | undefined,
): AnalyticsDeviceType | null {
  if (
    viewportWidth === null ||
    viewportWidth === undefined ||
    !Number.isInteger(viewportWidth) ||
    viewportWidth <= 0 ||
    viewportWidth > 10_000
  ) {
    return null
  }
  if (viewportWidth <= 767) return 'mobile'
  if (viewportWidth <= 1023) return 'tablet'
  return 'desktop'
}

export function analyticsReferrerHost(
  referrer: string | null | undefined,
  currentHost: string,
): string | null {
  if (!referrer) return null

  try {
    const url = new URL(referrer)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    const ownHostname = currentHost
      .split(':')[0]
      ?.toLowerCase()
      .replace(/^www\./, '')

    if (
      !hostname ||
      hostname === ownHostname ||
      hostname.length > 253 ||
      !hostnamePattern.test(hostname)
    ) {
      return null
    }
    return hostname
  } catch {
    return null
  }
}

export function analyticsUtmSource(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim().toLowerCase()
  return normalized ? normalized.slice(0, 120) : null
}
