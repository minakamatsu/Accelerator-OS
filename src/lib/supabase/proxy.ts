import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { readSupabasePublicConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export type SessionRefreshResult = {
  response: NextResponse
  configured: boolean
  userId: string | null
}

export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<SessionRefreshResult> {
  const config = readSupabasePublicConfig()
  let response = NextResponse.next({ request })

  if (!config) {
    return { response, configured: false, userId: null }
  }

  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getClaims()
  const subject = error ? null : data?.claims?.sub

  return {
    response,
    configured: true,
    userId: typeof subject === 'string' ? subject : null,
  }
}

export function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options)
  })
  return target
}
