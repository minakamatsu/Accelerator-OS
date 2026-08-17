import { describe, expect, it, vi } from 'vitest'
import { developmentSpamProvider } from '@/lib/providers/spam'

describe('development spam adapter', () => {
  it('labels a normal local submission as development-verified', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2_000)
    await expect(
      developmentSpamProvider.verify({
        honeypot: '',
        startedAt: 1_000,
        token: '',
        remoteIp: null,
      }),
    ).resolves.toEqual({ outcome: 'verified', provider: 'development' })
  })

  it('rejects a filled honeypot', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(2_000)
    const result = await developmentSpamProvider.verify({
      honeypot: 'https://spam.example',
      startedAt: 1_000,
      token: '',
      remoteIp: null,
    })
    expect(result.outcome).toBe('rejected')
  })
})
