import { z } from 'zod'

const optionalSecret = z.string().min(1).optional()

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalSecret,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalSecret,
})

export const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  PLATFORM_ROOT_DOMAIN: z.string().min(1).default('localhost'),
  SUPABASE_SECRET_KEY: optionalSecret,
  EMAIL_PROVIDER: z.enum(['development', 'resend']).default('development'),
  RESEND_API_KEY: optionalSecret,
  RESEND_WEBHOOK_SECRET: optionalSecret,
  EMAIL_FROM: z.string().email().optional(),
  BILLING_PROVIDER: z.enum(['development', 'square']).default('development'),
  SQUARE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  SQUARE_ACCESS_TOKEN: optionalSecret,
  SQUARE_LOCATION_ID: optionalSecret,
  SQUARE_WEBHOOK_SIGNATURE_KEY: optionalSecret,
  TURNSTILE_MODE: z.enum(['development', 'enabled']).default('development'),
  TURNSTILE_SECRET_KEY: optionalSecret,
  CRON_SECRET: optionalSecret,
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input)

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')
    throw new Error(`Invalid server environment configuration: ${fields}`)
  }

  const env = result.data
  const problems: string[] = []

  if (
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) !==
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  ) {
    problems.push(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set together',
    )
  }

  if (env.SUPABASE_SECRET_KEY && !env.NEXT_PUBLIC_SUPABASE_URL) {
    problems.push(
      'NEXT_PUBLIC_SUPABASE_URL is required when SUPABASE_SECRET_KEY is set',
    )
  }

  if (env.EMAIL_PROVIDER === 'resend') {
    if (!env.RESEND_API_KEY) problems.push('RESEND_API_KEY')
    if (!env.EMAIL_FROM) problems.push('EMAIL_FROM')
  }

  if (env.BILLING_PROVIDER === 'square') {
    if (!env.SQUARE_ACCESS_TOKEN) problems.push('SQUARE_ACCESS_TOKEN')
    if (!env.SQUARE_LOCATION_ID) problems.push('SQUARE_LOCATION_ID')
  }

  if (env.TURNSTILE_MODE === 'enabled' && !env.TURNSTILE_SECRET_KEY) {
    problems.push('TURNSTILE_SECRET_KEY')
  }

  if (problems.length > 0) {
    throw new Error(
      `Missing configuration for enabled providers: ${problems.join(', ')}`,
    )
  }

  return env
}
