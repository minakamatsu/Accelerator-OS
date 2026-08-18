import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('account security', () => {
  it('keeps password recovery private and revokes existing sessions', () => {
    const requestAction = source('src/app/(auth)/forgot-password/actions.ts')
    const updateAction = source('src/app/(auth)/update-password/actions.ts')

    expect(requestAction).toContain('resetPasswordForEmail')
    expect(requestAction).toContain('If an account uses that email')
    expect(requestAction).not.toContain('User not found')
    expect(updateAction).toContain("signOut({ scope: 'global' })")
    expect(updateAction).toContain(".min(12, 'Use at least 12 characters.')")
  })

  it('requires an AAL2 session in the server and database admin boundaries', () => {
    const guards = source('src/lib/auth/guards.ts')
    const migration = source(
      'supabase/migrations/20260817234441_administrator_mfa_enforcement.sql',
    )

    expect(guards).toContain("access.assuranceLevel !== 'aal2'")
    expect(guards).toContain("redirect('/mfa?next=/admin' as Route)")
    expect(migration).toContain("auth.jwt() ->> 'aal') = 'aal2'")
  })

  it('provides enrollment and challenge paths for authenticator-app MFA', () => {
    const gate = source('src/components/mfa-gate.tsx')
    const proxy = source('src/proxy.ts')

    expect(gate).toContain('supabase.auth.mfa.enroll')
    expect(gate).toContain('supabase.auth.mfa.challenge')
    expect(gate).toContain('supabase.auth.mfa.verify')
    expect(proxy).toContain("'/mfa'")
  })
})
