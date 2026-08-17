import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Supabase privileged-code boundaries', () => {
  it('marks the admin client as server-only', () => {
    const source = readFileSync(new URL('./admin.ts', import.meta.url), 'utf8')
    expect(source.startsWith("import 'server-only'")).toBe(true)
    expect(source).toContain('SUPABASE_SECRET_KEY')
  })

  it('does not expose the secret key through the browser client', () => {
    const source = readFileSync(new URL('./client.ts', import.meta.url), 'utf8')
    expect(source).not.toContain('SUPABASE_SECRET_KEY')
    expect(source).not.toContain('@/lib/env/server')
  })
})
