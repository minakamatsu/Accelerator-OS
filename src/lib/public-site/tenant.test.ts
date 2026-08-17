import { describe, expect, it } from 'vitest'
import {
  isPlatformHostname,
  isPublicSiteSlug,
  isSameOriginRequest,
  normalizeHostname,
  publicSiteRewritePath,
} from '@/lib/public-site/tenant'

describe('public tenant routing', () => {
  it('normalizes case, ports, and a trailing dot', () => {
    expect(normalizeHostname(' Demo-Atlas-Auto.Localhost.:3000 ')).toBe(
      'demo-atlas-auto.localhost',
    )
  })

  it('distinguishes platform, preview, and tenant hosts', () => {
    expect(isPlatformHostname('localhost', 'localhost')).toBe(true)
    expect(isPlatformHostname('192.168.1.25', 'localhost')).toBe(true)
    expect(isPlatformHostname('preview-123.vercel.app', 'example.com')).toBe(
      true,
    )
    expect(isPlatformHostname('demo-atlas-auto.localhost', 'localhost')).toBe(
      false,
    )
  })

  it('accepts only canonical preview slugs', () => {
    expect(isPublicSiteSlug('demo-atlas-auto')).toBe(true)
    expect(isPublicSiteSlug('../admin')).toBe(false)
    expect(isPublicSiteSlug('Demo Atlas')).toBe(false)
  })

  it('preserves tenant subpaths when routing a custom hostname', () => {
    expect(publicSiteRewritePath('demo-atlas-auto', '/')).toBe(
      '/site/demo-atlas-auto',
    )
    expect(publicSiteRewritePath('demo-atlas-auto', '/services/brakes')).toBe(
      '/site/demo-atlas-auto/services/brakes',
    )
  })

  it('requires a matching browser origin for public event capture', () => {
    expect(
      isSameOriginRequest(
        new Request('http://localhost:3000/api/public', {
          headers: { origin: 'http://localhost:3000' },
        }),
      ),
    ).toBe(true)
    expect(
      isSameOriginRequest(
        new Request('http://localhost:3000/api/public', {
          headers: { origin: 'https://attacker.example' },
        }),
      ),
    ).toBe(false)
  })
})
