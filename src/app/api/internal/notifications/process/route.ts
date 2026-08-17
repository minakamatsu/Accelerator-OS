import { timingSafeEqual } from 'node:crypto'
import { processBusinessNotificationJobs } from '@/lib/notifications/worker'
import { serverEnv } from '@/lib/env/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorized(request: Request): boolean {
  const secret = serverEnv.CRON_SECRET
  const supplied = request.headers.get('authorization')
  if (!secret || !supplied?.startsWith('Bearer ')) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(supplied)
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  )
}

async function processRequest(request: Request): Promise<Response> {
  if (!serverEnv.CRON_SECRET) {
    return Response.json(
      { error: 'Scheduled notifications are not configured.' },
      { status: 503 },
    )
  }
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const result = await processBusinessNotificationJobs({ limit: 25 })
    return Response.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json(
      { error: 'Notification processing could not be completed.' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  return processRequest(request)
}

export async function POST(request: Request) {
  return processRequest(request)
}
