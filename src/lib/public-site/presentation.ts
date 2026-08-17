import type { Metadata, Route } from 'next'
import type { PublicSite } from './schema'
import { normalizeHostname } from './tenant'

export const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
} as const

export function isDemoSite(site: PublicSite): boolean {
  return site.name.startsWith('[DEMO]')
}

export function stripDemoLabel(value: string): string {
  return value.replace(/^\[DEMO]\s*/i, '')
}

export function formatCategory(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function safeColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
    ? value
    : fallback
}

export function formatTime(value: string): string {
  const [hourText, minute = '00'] = value.split(':')
  const hour = Number(hourText)
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${suffix}`
}

export function formatAddress(profile: PublicSite['profile']): string {
  return [
    profile.addressLine1,
    profile.addressLine2,
    profile.city,
    profile.region,
    profile.postalCode,
  ]
    .filter(Boolean)
    .join(', ')
}

export function publicSiteBasePath(
  site: PublicSite,
  requestHostname: string | null,
): string {
  const currentHost = normalizeHostname(requestHostname)
  const primaryHost = normalizeHostname(site.primaryHostname)

  return currentHost && primaryHost === currentHost
    ? ''
    : `/site/${encodeURIComponent(site.slug)}`
}

export function publicSiteHref(basePath: string, path = '/'): Route {
  if (path === '/') return (basePath || '/') as Route
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}` as Route
}

export function canonicalUrl(site: PublicSite, path = '/'): string | undefined {
  if (isDemoSite(site)) return undefined
  const hostname = normalizeHostname(site.primaryHostname)
  if (!hostname) return undefined
  const normalizedPath =
    path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `https://${hostname}${normalizedPath}`
}

export function siteMetadata(
  site: PublicSite,
  options: { title?: string; description: string; path?: string },
): Metadata {
  const indexable = !isDemoSite(site)
  const canonical = canonicalUrl(site, options.path)
  const title = options.title ?? site.name

  return {
    title: options.title ? title : { absolute: title },
    description: options.description,
    alternates: canonical ? { canonical } : undefined,
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: 'website',
      title,
      description: options.description,
      locale: site.profile.locale.replace('-', '_'),
      siteName: site.name,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: options.description,
    },
  }
}

export function siteJsonLd(site: PublicSite): Record<string, unknown> {
  const openingHoursSpecification = Object.entries(dayLabels).flatMap(
    ([day, label]) => {
      const hours = site.profile.hours[day]
      return hours
        ? [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: `https://schema.org/${label}`,
              opens: hours.open,
              closes: hours.close,
            },
          ]
        : []
    },
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: stripDemoLabel(site.name),
    description: stripDemoLabel(site.profile.valueProposition),
    telephone: site.profile.publicPhone,
    email: site.profile.publicEmail ?? undefined,
    url: canonicalUrl(site),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [site.profile.addressLine1, site.profile.addressLine2]
        .filter(Boolean)
        .join(', '),
      addressLocality: site.profile.city,
      addressRegion: site.profile.region,
      postalCode: site.profile.postalCode,
      addressCountry: site.profile.countryCode,
    },
    areaServed: site.profile.serviceArea
      ? stripDemoLabel(site.profile.serviceArea)
      : undefined,
    openingHoursSpecification,
  }
}
