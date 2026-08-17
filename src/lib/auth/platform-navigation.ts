import type { Route } from 'next'

export type PlatformAccessLevel = 'development' | 'admin' | 'member'

export type PlatformNavigationItem = {
  href: Route
  label: string
  exact?: boolean
}

export function getPlatformNavigation(
  accessLevel: PlatformAccessLevel,
  businessId?: string,
): {
  homeHref: Route
  navigation: PlatformNavigationItem[]
  roleLabel: string
} {
  if (accessLevel === 'member') {
    const homeHref = businessId
      ? (`/portal/businesses/${businessId}` as Route)
      : '/portal'
    return {
      homeHref,
      navigation: businessId
        ? [
            { href: homeHref, label: 'Dashboard', exact: true },
            {
              href: `/portal/businesses/${businessId}/website-preview` as Route,
              label: 'View website',
              exact: true,
            },
          ]
        : [{ href: '/portal', label: 'Dashboard', exact: true }],
      roleLabel: 'Client account',
    }
  }

  return {
    homeHref: '/admin',
    navigation: [
      { href: '/admin', label: 'Client businesses', exact: true },
      {
        href: '/admin/notifications' as Route,
        label: 'Email notifications',
      },
    ],
    roleLabel:
      accessLevel === 'admin' ? 'Agency administrator' : 'Development admin',
  }
}
