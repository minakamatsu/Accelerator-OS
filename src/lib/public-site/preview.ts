export const publicPreviewCookie = 'accelerator_public_preview'

export function publicWebsiteUrl({
  hostname,
  appUrl,
  fallbackPath,
}: {
  hostname: string | null
  appUrl: string
  fallbackPath: string
}): string {
  if (!hostname) return fallbackPath

  const platformUrl = new URL(appUrl)
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost')
  const protocol = isLocal ? platformUrl.protocol : 'https:'
  const port = isLocal && platformUrl.port ? `:${platformUrl.port}` : ''

  return `${protocol}//${hostname}${port}/`
}
