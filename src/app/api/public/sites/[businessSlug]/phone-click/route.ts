import { recordPublicPhoneClick } from '@/data/public-site'
import { isPublicSiteSlug, isSameOriginRequest } from '@/lib/public-site/tenant'
import { z } from 'zod'

type Context = {
  params: Promise<{ businessSlug: string }>
}

const responseHeaders = {
  'Cache-Control': 'no-store',
}

const payloadSchema = z.object({
  path: z.string().trim().min(1).max(500).startsWith('/'),
  visitorId: z.string().uuid(),
})

export async function POST(request: Request, { params }: Context) {
  const { businessSlug } = await params

  if (!isPublicSiteSlug(businessSlug) || !isSameOriginRequest(request)) {
    return new Response(null, { status: 204, headers: responseHeaders })
  }

  const payload = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(payload)
  if (parsed.success) {
    await recordPublicPhoneClick(businessSlug, parsed.data.path, {
      visitorId: parsed.data.visitorId,
    })
  }
  return new Response(null, { status: 204, headers: responseHeaders })
}
