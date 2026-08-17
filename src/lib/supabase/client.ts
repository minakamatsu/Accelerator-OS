'use client'

import { createBrowserClient } from '@supabase/ssr'
import { requireSupabasePublicConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export function createClient() {
  const config = requireSupabasePublicConfig()
  return createBrowserClient<Database>(config.url, config.publishableKey)
}
