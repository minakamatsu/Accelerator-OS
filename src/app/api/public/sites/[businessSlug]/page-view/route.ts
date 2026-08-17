import { z } from 'zod'
import { recordPublicPageView } from '@/data/public-site'
import { isPublicSiteSlug, isSameOriginRequest } from '@/lib/public-site/tenant'

type Context = {
  params: Promise<{ businessSlug: string }>
}

const payloadSchema = z.object({
  path: z.string().trim().min(1).max(500).startsWith('/'),
  visitorId: z.string().uuid(),
  referrer: z.string().trim().max(1000),
  utmSource: z.string().trim().max(120),
  viewportWidth: z.number().int().positive().max(10_000),
})

const responseHeaders = {
  'Cache-Control': 'no-store',
}

export async function POST(request: Request, { params }: Context) {
  const { businessSlug } = await params

  if (!isPublicSiteSlug(businessSlug) || !isSameOriginRequest(request)) {
    return new Response(null, { status: 204, headers: responseHeaders })
  }

  const payload = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(payload)
  if (parsed.success) {
    await recordPublicPageView(businessSlug, parsed.data.path, {
      visitorId: parsed.data.visitorId,
      referrer: parsed.data.referrer,
      currentHost: new URL(request.url).host,
      utmSource: parsed.data.utmSource,
      viewportWidth: parsed.data.viewportWidth,
    })
  }

  return new Response(null, { status: 204, headers: responseHeaders })
}
