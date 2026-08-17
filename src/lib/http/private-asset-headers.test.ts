import { describe, expect, it } from 'vitest'
import {
  getProtectedAssetHeaders,
  protectedAssetCacheControl,
} from '@/lib/http/private-asset-headers'

describe('protected asset responses', () => {
  it('cannot be reused from the browser cache after sign-out', () => {
    expect(protectedAssetCacheControl).toContain('no-store')
    expect(getProtectedAssetHeaders('image/png')).toEqual({
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
    })
  })
})
