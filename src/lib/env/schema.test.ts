import { describe, expect, it } from 'vitest'
import { parseServerEnv } from '@/lib/env/schema'

describe('server environment validation', () => {
  it('uses safe development adapters when provider configuration is absent', () => {
    const env = parseServerEnv({ NODE_ENV: 'test' })

    expect(env.EMAIL_PROVIDER).toBe('development')
    expect(env.BILLING_PROVIDER).toBe('development')
    expect(env.TURNSTILE_MODE).toBe('development')
  })

  it('treats blank Vercel variables as unconfigured', () => {
    const env = parseServerEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '   ',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: '',
      APP_URL: '',
      PLATFORM_ROOT_DOMAIN: '',
      SUPABASE_SECRET_KEY: '',
      EMAIL_PROVIDER: '',
      RESEND_API_KEY: '',
      RESEND_WEBHOOK_SECRET: '',
      EMAIL_FROM: '',
      BILLING_PROVIDER: '',
      SQUARE_ENVIRONMENT: '',
      SQUARE_ACCESS_TOKEN: '',
      SQUARE_LOCATION_ID: '',
      SQUARE_WEBHOOK_SIGNATURE_KEY: '',
      TURNSTILE_MODE: '',
      TURNSTILE_SECRET_KEY: '',
      CRON_SECRET: '',
    })

    expect(env.APP_URL).toBe('http://localhost:3000')
    expect(env.PLATFORM_ROOT_DOMAIN).toBe('localhost')
    expect(env.EMAIL_PROVIDER).toBe('development')
    expect(env.BILLING_PROVIDER).toBe('development')
    expect(env.TURNSTILE_MODE).toBe('development')
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined()
  })

  it('derives application URLs from Vercel system configuration', () => {
    const env = parseServerEnv({
      NODE_ENV: 'production',
      VERCEL_URL: 'accelerator-os-preview.vercel.app',
      APP_URL: '',
      PLATFORM_ROOT_DOMAIN: '',
    })

    expect(env.APP_URL).toBe('https://accelerator-os-preview.vercel.app')
    expect(env.PLATFORM_ROOT_DOMAIN).toBe('accelerator-os-preview.vercel.app')
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
