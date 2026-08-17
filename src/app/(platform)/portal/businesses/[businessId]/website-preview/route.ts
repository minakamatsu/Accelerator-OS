import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import { publicPreviewCookie } from '@/lib/public-site/preview'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ businessId: string }> }

export async function GET(request: NextRequest, { params }: Context) {
  await requireAuthenticatedUser()
  const { businessId } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug, business_profiles(website_url)')
    .eq('id', businessId)
    .maybeSingle()

  if (!business) {
    return NextResponse.redirect(
      new URL('/portal?notice=preview-unavailable', request.url),
    )
  }

  if (business.business_profiles?.website_url) {
    return NextResponse.redirect(business.business_profiles.website_url)
  }

  const response = NextResponse.redirect(
    new URL(`/site/${business.slug}`, request.url),
  )
  response.cookies.set(publicPreviewCookie, business.slug, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  })
  return response
}
