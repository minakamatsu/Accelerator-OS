import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//'))
    return '/portal'
  return value
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL('/sign-in?error=auth-not-configured', request.url),
    )
  }

  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  const nextPath = safeNextPath(request.nextUrl.searchParams.get('next'))

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url))
    }
  }

  return NextResponse.redirect(
    new URL('/sign-in?error=invalid-link', request.url),
  )
}
