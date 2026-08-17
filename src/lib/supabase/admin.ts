import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { serverEnv } from '@/lib/env/server'
import { requireSupabasePublicConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export function createAdminClient() {
  const config = requireSupabasePublicConfig()
  const secretKey = serverEnv.SUPABASE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Server-only Supabase secret access is not configured.')
  }

  return createSupabaseClient<Database>(config.url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
