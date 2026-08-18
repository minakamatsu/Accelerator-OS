import 'server-only'
import type { Route } from 'next'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export type AccessContext =
  | {
      mode: 'development'
      userId: null
      email: null
      platformRole: null
      assuranceLevel: null
    }
  | {
      mode: 'authenticated'
      userId: string
      email: string | null
      platformRole: 'admin' | 'member'
      assuranceLevel: 'aal1' | 'aal2'
    }

export const getPrimaryAccessContext = cache(
  async (): Promise<AccessContext> => {
    if (!isSupabaseConfigured()) {
      return {
        mode: 'development',
        userId: null,
        email: null,
        platformRole: null,
        assuranceLevel: null,
      }
    }

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims()
    const subject = claimsError ? null : claimsData?.claims?.sub
    const email =
      typeof claimsData?.claims?.email === 'string'
        ? claimsData.claims.email
        : null
    const assuranceLevel = claimsData?.claims?.aal === 'aal2' ? 'aal2' : 'aal1'

    if (typeof subject !== 'string') {
      redirect('/sign-in')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('platform_role')
      .eq('id', subject)
      .single()

    if (profileError || !profile) {
      redirect('/sign-in?error=profile-unavailable')
    }

    return {
      mode: 'authenticated',
      userId: subject,
      email,
      platformRole: profile.platform_role,
      assuranceLevel,
    }
  },
)

export const getAccessContext = cache(async (): Promise<AccessContext> => {
  const access = await getPrimaryAccessContext()

  if (
    access.mode === 'authenticated' &&
    access.platformRole === 'admin' &&
    access.assuranceLevel !== 'aal2'
  ) {
    redirect('/mfa?next=/admin' as Route)
  }

  return access
})

export async function requireAuthenticatedUser() {
  return getAccessContext()
}

export async function requirePlatformAdmin() {
  const access = await getAccessContext()

  if (access.mode === 'authenticated' && access.platformRole !== 'admin') {
    redirect('/portal?notice=admin-access-required')
  }

  return access
}
