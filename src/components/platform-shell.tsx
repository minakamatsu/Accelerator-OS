import type { ReactNode } from 'react'
import { PlatformShellClient } from '@/components/platform-shell-client'
import { listAccessibleBusinesses } from '@/data/businesses'
import { getAccessContext } from '@/lib/auth/guards'
import { getPlatformNavigation } from '@/lib/auth/platform-navigation'

export async function PlatformShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const access = await getAccessContext()
  const accessLevel =
    access.mode === 'development' ? 'development' : access.platformRole
  const businesses =
    accessLevel === 'member' ? await listAccessibleBusinesses() : []
  const shell = getPlatformNavigation(
    accessLevel,
    businesses.length === 1 ? businesses[0].id : undefined,
  )
  const profileImageHref =
    access.mode === 'authenticated' && access.avatarPath
      ? `/api/profile-avatar?v=${encodeURIComponent(access.profileUpdatedAt)}`
      : null

  return (
    <PlatformShellClient
      accountLabel={
        access.mode === 'authenticated' && access.displayName
          ? access.displayName
          : shell.roleLabel
      }
      homeHref={shell.homeHref}
      navigation={shell.navigation}
      profileImageHref={profileImageHref}
      roleLabel={shell.roleLabel}
      theme={accessLevel === 'member' ? 'client' : 'agency'}
    >
      {children}
    </PlatformShellClient>
  )
}
