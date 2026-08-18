import { describe, expect, it } from 'vitest'
import { safeNextPath } from '@/lib/auth/safe-next-path'

describe('safeNextPath', () => {
  it('preserves internal paths, queries, and fragments', () => {
    expect(safeNextPath('/portal?range=30#summary', '/portal')).toBe(
      '/portal?range=30#summary',
    )
  })

  it.each([
    undefined,
    null,
    '',
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/portal\\example.com',
  ])('uses the fallback for unsafe path %s', (value) => {
    expect(safeNextPath(value, '/portal')).toBe('/portal')
  })
})
