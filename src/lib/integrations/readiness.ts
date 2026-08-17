import 'server-only'
import { serverEnv } from '@/lib/env/server'
import type { IntegrationReadiness } from '@/lib/integrations/readiness-schema'

export function getIntegrationReadiness(): IntegrationReadiness[] {
  return [
    {
      name: 'Authentication',
      label:
        serverEnv.NEXT_PUBLIC_SUPABASE_URL &&
        serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? 'configured'
          : 'development',
      detail:
        serverEnv.NEXT_PUBLIC_SUPABASE_URL &&
        serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? 'Supabase authentication and verified server-side sessions are active.'
          : 'No sign-in or user session is active.',
    },
    {
      name: 'Email',
      label:
        serverEnv.EMAIL_PROVIDER === 'resend' ? 'configured' : 'development',
      detail:
        serverEnv.EMAIL_PROVIDER === 'resend'
          ? 'Resend is configured for server-only transactional delivery.'
          : 'Business notifications are captured in the agency delivery log and never sent.',
    },
    {
      name: 'Billing',
      label:
        serverEnv.BILLING_PROVIDER === 'square' ? 'configured' : 'development',
      detail:
        serverEnv.BILLING_PROVIDER === 'square'
          ? 'Square configuration is present; checkout is not implemented yet.'
          : 'No checkout or payment processing is available.',
    },
    {
      name: 'Spam protection',
      label:
        serverEnv.TURNSTILE_MODE === 'enabled' ? 'configured' : 'development',
      detail:
        serverEnv.TURNSTILE_MODE === 'enabled'
          ? 'Turnstile challenges are verified server-side before lead capture.'
          : 'A labeled development adapter checks timing and honeypot signals.',
    },
  ]
}
