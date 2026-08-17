'use client'

const visitorStorageKey = 'accelerator-anonymous-visitor-v1'
const attributionStoragePrefix = 'accelerator-attribution-v1'
let memoryVisitorId: string | null = null

export type BrowserAnalyticsAttribution = {
  referrer: string
  utmSource: string
}

function newVisitorId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

export function getAnalyticsVisitorId(): string {
  if (memoryVisitorId) return memoryVisitorId

  try {
    const stored = window.localStorage.getItem(visitorStorageKey)
    if (stored) {
      memoryVisitorId = stored
      return stored
    }
  } catch {
    // Analytics remains optional when storage is unavailable.
  }

  memoryVisitorId = newVisitorId()
  try {
    window.localStorage.setItem(visitorStorageKey, memoryVisitorId)
  } catch {
    // Keep the in-memory identifier for this page lifecycle.
  }
  return memoryVisitorId
}

export function getAnalyticsAttribution(
  businessSlug: string,
): BrowserAnalyticsAttribution {
  const key = `${attributionStoragePrefix}:${businessSlug}`
  try {
    const stored = window.sessionStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<BrowserAnalyticsAttribution>
      if (
        typeof parsed.referrer === 'string' &&
        typeof parsed.utmSource === 'string'
      ) {
        return { referrer: parsed.referrer, utmSource: parsed.utmSource }
      }
    }
  } catch {
    // Fall through to fresh, minimal attribution.
  }

  const attribution = {
    referrer: document.referrer,
    utmSource:
      new URLSearchParams(window.location.search).get('utm_source') ?? '',
  }
  try {
    window.sessionStorage.setItem(key, JSON.stringify(attribution))
  } catch {
    // Attribution can still be sent for this page view.
  }
  return attribution
}
