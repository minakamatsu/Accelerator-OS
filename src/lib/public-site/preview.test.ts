import { describe, expect, it } from 'vitest'
import { publicWebsiteUrl } from './preview'

describe('public website destinations', () => {
  it('uses the verified local hostname and development port', () => {
    expect(
      publicWebsiteUrl({
        hostname: 'demo-atlas-auto.localhost',
        appUrl: 'http://localhost:3000',
        fallbackPath: '/site/demo-atlas-auto',
      }),
    ).toBe('http://demo-atlas-auto.localhost:3000/')
  })

  it('uses HTTPS for a verified production hostname', () => {
    expect(
      publicWebsiteUrl({
        hostname: 'www.example-auto.com',
        appUrl: 'https://app.example.com',
        fallbackPath: '/site/example-auto',
      }),
    ).toBe('https://www.example-auto.com/')
  })

  it('uses the public platform path until a domain is verified', () => {
    expect(
      publicWebsiteUrl({
        hostname: null,
        appUrl: 'https://app.example.com',
        fallbackPath: '/site/example-auto',
      }),
    ).toBe('/site/example-auto')
  })
})
