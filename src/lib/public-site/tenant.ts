const ipv4Pattern = /^\d{1,3}(?:\.\d{1,3}){3}$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeHostname(value: string | null): string | null {
  const trimmed = value?.trim().toLowerCase()
  if (!trimmed) return null

  const withoutPort = trimmed.startsWith('[')
    ? trimmed.slice(1, trimmed.indexOf(']'))
    : trimmed.split(':')[0]
  const normalized = withoutPort?.replace(/\.$/, '')

  return normalized || null
}

export function isPlatformHostname(
  hostname: string,
  platformRootDomain: string,
): boolean {
  const root = normalizeHostname(platformRootDomain)

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    ipv4Pattern.test(hostname) ||
    hostname.endsWith('.vercel.app') ||
    hostname === root
  )
}

export function isPublicSiteSlug(value: string): boolean {
  return slugPattern.test(value)
}

export function publicSiteRewritePath(slug: string, pathname: string): string {
  const suffix = pathname === '/' ? '' : pathname
  return `/site/${encodeURIComponent(slug)}${suffix}`
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}
