import { describe, expect, it } from 'vitest'
import { parseServerEnv } from '@/lib/env/schema'

describe('server environment validation', () => {
  it('uses safe development adapters when provider configuration is absent', () => {
    const env = parseServerEnv({ NODE_ENV: 'test' })

    expect(env.EMAIL_PROVIDER).toBe('development')
    expect(env.BILLING_PROVIDER).toBe('development')
    expect(env.TURNSTILE_MODE).toBe('development')
  })

  it('does not include secret values in validation errors', () => {
    const secret = 'should-never-appear'

    expect(() =>
      parseServerEnv({
        NODE_ENV: 'test',
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: secret,
      }),
    ).toThrow('EMAIL_FROM')

    try {
      parseServerEnv({
        NODE_ENV: 'test',
        EMAIL_PROVIDER: 'resend',
        RESEND_API_KEY: secret,
      })
    } catch (error) {
      expect(String(error)).not.toContain(secret)
    }
  })

  it('requires provider credentials only when that provider is enabled', () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: 'test',
        BILLING_PROVIDER: 'square',
      }),
    ).toThrow('SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID')
  })
})
