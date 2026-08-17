import { getPublicSiteBySlug } from '@/data/public-site'
import { canonicalUrl, isDemoSite } from '@/lib/public-site/presentation'

type Context = { params: Promise<{ businessSlug: string }> }

export async function GET(_request: Request, { params }: Context) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  const indexable = site && !isDemoSite(site) && canonicalUrl(site)
  const body = indexable
    ? `User-agent: *\nAllow: /\nSitemap: ${canonicalUrl(site, '/sitemap.xml')}\n`
    : 'User-agent: *\nDisallow: /\n'

  return new Response(body, {
    status: site ? 200 : 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
