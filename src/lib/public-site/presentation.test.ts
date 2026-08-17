import { describe, expect, it } from 'vitest'
import type { PublicSite } from './schema'
import {
  canonicalUrl,
  publicSiteBasePath,
  publicSiteHref,
} from './presentation'

const site = {
  slug: 'example-auto',
  name: 'Example Auto',
  primaryHostname: 'www.example-auto.com',
} as PublicSite

describe('public site URLs', () => {
  it('uses clean root paths on the verified tenant hostname', () => {
    const basePath = publicSiteBasePath(site, 'www.example-auto.com:443')
    expect(basePath).toBe('')
    expect(publicSiteHref(basePath, '/services')).toBe('/services')
  })

  it('keeps the tenant slug for platform previews', () => {
    const basePath = publicSiteBasePath(site, 'localhost:3000')
    expect(publicSiteHref(basePath, '/services')).toBe(
      '/site/example-auto/services',
    )
  })

  it('builds canonical URLs only for publishable sites', () => {
    expect(canonicalUrl(site, '/services')).toBe(
      'https://www.example-auto.com/services',
    )
    expect(canonicalUrl({ ...site, name: '[DEMO] Example Auto' }, '/')).toBe(
      undefined,
    )
  })
})
