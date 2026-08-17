import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export type AccessContext =
  | { mode: 'development'; userId: null; platformRole: null }
  | {
      mode: 'authenticated'
      userId: string
      platformRole: 'admin' | 'member'
    }

export const getAccessContext = cache(async (): Promise<AccessContext> => {
  if (!isSupabaseConfigured()) {
    return { mode: 'development', userId: null, platformRole: null }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const subject = claimsError ? null : claimsData?.claims?.sub

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
    platformRole: profile.platform_role,
  }
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
