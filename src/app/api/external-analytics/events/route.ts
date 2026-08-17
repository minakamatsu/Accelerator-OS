import { recordExternalAnalyticsEvent } from '@/lib/analytics/external-event'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const siteKey = new URL(request.url).searchParams.get('site')
  const origin = request.headers.get('origin')
  const contentLength = Number(request.headers.get('content-length') ?? 0)

  if (!siteKey || !origin || contentLength > 12_000) {
    return new Response(null, { status: 400 })
  }

  let body: unknown
  try {
    body = JSON.parse(await request.text())
  } catch {
    return new Response(null, { status: 400 })
  }

  const recorded = await recordExternalAnalyticsEvent({
    siteKey,
    origin,
    body,
  })

  return new Response(null, {
    status: recorded ? 204 : 403,
    headers: { 'Cache-Control': 'no-store' },
  })
}
