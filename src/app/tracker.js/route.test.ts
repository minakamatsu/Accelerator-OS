import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('external analytics tracker', () => {
  it('rejects a malformed site key', async () => {
    const response = await GET(
      new Request('http://localhost:3000/tracker.js?site=not-a-key'),
    )
    expect(response.status).toBe(400)
  })

  it('serves a tenant-keyed tracker without a browser business id', async () => {
    const response = await GET(
      new Request(
        'http://localhost:3000/tracker.js?site=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    )
    const script = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/javascript')
    expect(script).toContain('navigator.sendBeacon')
    expect(script).toContain('window.AcceleratorAnalytics')
    expect(script).toContain('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
    expect(script).not.toContain('businessId')
  })
})
