import { describe, expect, it } from 'vitest'
import { formatPhoneDisplay, phoneHref } from './phone'

describe('public phone presentation', () => {
  it('formats a North American number without the visually heavy country code', () => {
    expect(formatPhoneDisplay('+1 555 010 1000')).toBe('555-010-1000')
  })

  it('formats an unprefixed ten-digit number', () => {
    expect(formatPhoneDisplay('(555) 010 1000')).toBe('555-010-1000')
  })

  it('preserves non-North-American display formats', () => {
    expect(formatPhoneDisplay('+44 20 7946 0958')).toBe('+44 20 7946 0958')
  })

  it('keeps the complete normalized number in the call link', () => {
    expect(phoneHref('+1 (555) 010-1000')).toBe('tel:+15550101000')
  })
})
