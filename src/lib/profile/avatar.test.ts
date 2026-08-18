import { describe, expect, it } from 'vitest'
import { detectAvatar, maxAvatarBytes } from '@/lib/profile/avatar'

describe('profile avatar validation', () => {
  it('recognizes supported image signatures only when MIME types agree', () => {
    expect(
      detectAvatar(new Uint8Array([0xff, 0xd8, 0xff]), 'image/jpeg'),
    ).toEqual({ extension: 'jpg', contentType: 'image/jpeg' })
    expect(
      detectAvatar(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        'image/png',
      ),
    ).toEqual({ extension: 'png', contentType: 'image/png' })
    expect(
      detectAvatar(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
        ]),
        'image/webp',
      ),
    ).toEqual({ extension: 'webp', contentType: 'image/webp' })
  })

  it('rejects spoofed and unsupported files', () => {
    expect(
      detectAvatar(new Uint8Array([0xff, 0xd8, 0xff]), 'image/png'),
    ).toBeNull()
    expect(
      detectAvatar(new Uint8Array([0x3c, 0x73, 0x76, 0x67]), 'image/svg+xml'),
    ).toBeNull()
  })

  it('limits profile pictures to two megabytes', () => {
    expect(maxAvatarBytes).toBe(2_097_152)
  })
})
