import { NextResponse, type NextRequest } from 'next/server'
import {
  copyResponseCookies,
  refreshSupabaseSession,
} from '@/lib/supabase/proxy'
import { resolvePublicSiteSlugByHostname } from '@/data/public-site'
import {
  isPlatformHostname,
  normalizeHostname,
  publicSiteRewritePath,
} from '@/lib/public-site/tenant'

const protectedPrefixes = ['/admin', '/portal']

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostname = normalizeHostname(request.headers.get('host'))
  const platformRootDomain = process.env.PLATFORM_ROOT_DOMAIN ?? 'localhost'

  if (
    hostname &&
    !isPlatformHostname(hostname, platformRootDomain) &&
    !pathname.startsWith('/api/')
  ) {
    const slug = await resolvePublicSiteSlugByHostname(hostname)
    const destination = slug
      ? publicSiteRewritePath(slug, pathname)
      : '/site/unavailable'
    const destinationUrl = new URL(destination, request.url)
    destinationUrl.search = search
    return NextResponse.rewrite(destinationUrl)
  }

  const session = await refreshSupabaseSession(request)
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (session.configured && isProtected && !session.userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('next', `${pathname}${search}`)
    return copyResponseCookies(
      session.response,
      NextResponse.redirect(signInUrl),
    )
  }

  if (session.configured && pathname === '/sign-in' && session.userId) {
    return copyResponseCookies(
      session.response,
      NextResponse.redirect(new URL('/portal', request.url)),
    )
  }

  return session.response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
