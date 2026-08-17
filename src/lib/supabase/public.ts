import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { readSupabasePublicConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export function createPublicClient() {
  const config = readSupabasePublicConfig()
  if (!config) return null

  return createSupabaseClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
