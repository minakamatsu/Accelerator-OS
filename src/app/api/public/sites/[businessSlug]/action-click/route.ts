import { z } from 'zod'
import { recordPublicActionClick } from '@/data/public-site'
import { isPublicSiteSlug, isSameOriginRequest } from '@/lib/public-site/tenant'

type Context = {
  params: Promise<{ businessSlug: string }>
}

const payloadSchema = z.object({
  action: z.enum(['directions', 'contact']),
  path: z.string().trim().min(1).max(500).startsWith('/'),
  visitorId: z.string().uuid(),
})

const responseHeaders = { 'Cache-Control': 'no-store' }

export async function POST(request: Request, { params }: Context) {
  const { businessSlug } = await params
  if (!isPublicSiteSlug(businessSlug) || !isSameOriginRequest(request)) {
    return new Response(null, { status: 204, headers: responseHeaders })
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null))
  if (parsed.success) {
    await recordPublicActionClick(
      businessSlug,
      parsed.data.path,
      parsed.data.action,
      { visitorId: parsed.data.visitorId },
    )
  }
  return new Response(null, { status: 204, headers: responseHeaders })
}
