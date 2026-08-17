import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireSupabasePublicConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export async function createClient() {
  const config = requireSupabasePublicConfig()
  const cookieStore = await cookies()

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies. Proxy refreshes the session.
        }
      },
    },
  })
}
