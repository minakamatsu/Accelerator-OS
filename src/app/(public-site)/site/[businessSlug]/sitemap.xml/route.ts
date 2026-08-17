import { getPublicSiteBySlug } from '@/data/public-site'
import { canonicalUrl, isDemoSite } from '@/lib/public-site/presentation'

type Context = { params: Promise<{ businessSlug: string }> }

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(_request: Request, { params }: Context) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site || isDemoSite(site) || !canonicalUrl(site)) {
    return new Response('Sitemap unavailable', { status: 404 })
  }

  const paths = [
    '/',
    '/services',
    '/vehicle-concerns',
    '/visit',
    '/quote',
    ...site.services.map((service) => `/services/${service.slug}`),
  ]
  const entries = paths
    .map((path) => {
      const url = canonicalUrl(site, path)
      return url ? `  <url><loc>${escapeXml(url)}</loc></url>` : ''
    })
    .filter(Boolean)
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
