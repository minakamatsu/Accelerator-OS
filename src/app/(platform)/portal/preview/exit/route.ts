import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import { serverEnv } from '@/lib/env/server'
import {
  publicPreviewCookie,
  publicWebsiteUrl,
} from '@/lib/public-site/preview'
import { isPublicSiteSlug } from '@/lib/public-site/tenant'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  await requireAuthenticatedUser()
  const requestUrl = new URL(request.url)
  const slug = requestUrl.searchParams.get('slug')
  const destination = requestUrl.searchParams.get('destination')

  if (!slug || !isPublicSiteSlug(slug)) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!business) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  let redirectTarget = `/portal/businesses/${business.id}`
  if (destination === 'website') {
    const { data: domain } = await supabase
      .from('business_domains')
      .select('hostname')
      .eq('business_id', business.id)
      .eq('status', 'verified')
      .not('verified_at', 'is', null)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    redirectTarget = publicWebsiteUrl({
      hostname: domain?.hostname ?? null,
      appUrl: serverEnv.APP_URL,
      fallbackPath: `/site/${business.slug}`,
    })
  }

  const response = NextResponse.redirect(new URL(redirectTarget, request.url))
  response.cookies.set(publicPreviewCookie, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
