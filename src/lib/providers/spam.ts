import 'server-only'
import { z } from 'zod'
import { serverEnv } from '@/lib/env/server'

export type SpamChallenge = {
  honeypot: string
  startedAt: number
  token: string
  remoteIp: string | null
}

export type SpamVerification =
  | { outcome: 'verified'; provider: 'development' | 'turnstile' }
  | { outcome: 'rejected'; code: 'bot_signal' | 'challenge_failed' }

export interface SpamProvider {
  readonly name: 'development' | 'turnstile'
  verify(challenge: SpamChallenge): Promise<SpamVerification>
}

export const developmentSpamProvider: SpamProvider = {
  name: 'development',
  async verify(challenge) {
    const elapsed = Date.now() - challenge.startedAt
    if (challenge.honeypot.trim() || elapsed < 500) {
      return { outcome: 'rejected', code: 'bot_signal' }
    }
    return { outcome: 'verified', provider: 'development' }
  },
}

const turnstileResponseSchema = z.object({ success: z.boolean() })

const turnstileSpamProvider: SpamProvider = {
  name: 'turnstile',
  async verify(challenge) {
    if (!challenge.token || !serverEnv.TURNSTILE_SECRET_KEY) {
      return { outcome: 'rejected', code: 'challenge_failed' }
    }

    const body = new URLSearchParams({
      secret: serverEnv.TURNSTILE_SECRET_KEY,
      response: challenge.token,
    })
    if (challenge.remoteIp) body.set('remoteip', challenge.remoteIp)

    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        { method: 'POST', body, cache: 'no-store' },
      )
      const parsed = turnstileResponseSchema.safeParse(await response.json())
      return parsed.success && parsed.data.success
        ? { outcome: 'verified', provider: 'turnstile' }
        : { outcome: 'rejected', code: 'challenge_failed' }
    } catch {
      return { outcome: 'rejected', code: 'challenge_failed' }
    }
  },
}

export function getSpamProvider(): SpamProvider {
  return serverEnv.TURNSTILE_MODE === 'enabled'
    ? turnstileSpamProvider
    : developmentSpamProvider
}
