import { describe, expect, it } from 'vitest'
import { getPlatformNavigation } from '@/lib/auth/platform-navigation'

describe('platform navigation', () => {
  it('returns agency home for administrators', () => {
    const adminNavigation = getPlatformNavigation('admin')
    expect(adminNavigation.homeHref).toBe('/admin')
    expect(adminNavigation.navigation.map((item) => item.href)).toContain(
      '/admin/notifications',
    )
    expect(getPlatformNavigation('development').homeHref).toBe('/admin')
  })

  it('returns client home without agency navigation for members', () => {
    const navigation = getPlatformNavigation(
      'member',
      '11111111-1111-4111-8111-111111111111',
    )

    expect(navigation.homeHref).toBe(
      '/portal/businesses/11111111-1111-4111-8111-111111111111',
    )
    expect(navigation.navigation.map((item) => item.label)).toEqual([
      'Dashboard',
      'View website',
    ])
    expect(navigation.navigation.map((item) => item.href)).not.toContain(
      '/portal/businesses/11111111-1111-4111-8111-111111111111/leads',
    )
    expect(navigation.navigation.map((item) => item.href)).not.toContain(
      '/admin',
    )
    expect(navigation.navigation.map((item) => item.href)).not.toContain(
      '/admin/notifications',
    )
  })

  it('fails closed to account setup when a member has no single business', () => {
    const navigation = getPlatformNavigation('member')
    expect(navigation.homeHref).toBe('/portal')
    expect(navigation.navigation).toEqual([
      { href: '/portal', label: 'Dashboard', exact: true },
    ])
  })
})
