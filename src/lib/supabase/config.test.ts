import { describe, expect, it } from 'vitest'
import { readSupabasePublicConfig } from '@/lib/supabase/config'

describe('Supabase public configuration', () => {
  it('returns null when Supabase is intentionally disconnected', () => {
    expect(readSupabasePublicConfig({})).toBeNull()
  })

  it('returns the public URL and publishable key together', () => {
    expect(
      readSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      }),
    ).toEqual({
      url: 'http://127.0.0.1:54321',
      publishableKey: 'sb_publishable_test',
    })
  })

  it('rejects partial configuration', () => {
    expect(() =>
      readSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      }),
    ).toThrow('must be configured together')
  })
})
