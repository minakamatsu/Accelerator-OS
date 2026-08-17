export type SupabasePublicConfig = {
  url: string
  publishableKey: string
}

type PublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
}

export function readSupabasePublicConfig(
  environment: PublicEnvironment = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
): SupabasePublicConfig | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url && !publishableKey) return null

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase URL and publishable key must be configured together.',
    )
  }

  return { url, publishableKey }
}

export function isSupabaseConfigured(): boolean {
  return readSupabasePublicConfig() !== null
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = readSupabasePublicConfig()

  if (!config) {
    throw new Error('Supabase is not configured for this environment.')
  }

  return config
}
