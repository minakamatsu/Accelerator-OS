import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { AccountProfileForm } from '@/components/account-profile-form'
import { listAccessibleBusinesses } from '@/data/businesses'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import { getPlatformNavigation } from '@/lib/auth/platform-navigation'

export const metadata: Metadata = {
  title: 'Profile & settings',
}

export default async function SettingsPage() {
  const access = await requireAuthenticatedUser()
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
  const displayName =
    access.mode === 'authenticated' && access.displayName
      ? access.displayName
      : shell.roleLabel

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-[var(--line)] pb-8">
        <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
          Your account
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
          Profile & settings
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
          Manage how your account appears and rotate your password without
          exposing it to the agency dashboard.
        </p>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Profile
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Personal details
          </h2>
          <p className="mt-3 leading-7 text-[var(--ink-muted)]">
            Your display name and picture appear only inside your signed-in
            workspace.
          </p>
          <AccountProfileForm
            avatarHref={profileImageHref}
            displayName={displayName}
            email={access.email}
          />
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Security
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Password & access
          </h2>
          <p className="mt-4 leading-7 text-[var(--ink-muted)]">
            Your password is handled by Supabase Auth. Accelerator OS cannot
            display it and does not save a readable copy in the application
            database.
          </p>
          <dl className="mt-6 grid gap-4 text-sm">
            {access.mode === 'authenticated' && access.email ? (
              <div className="grid gap-1 border-t border-[var(--line)] pt-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-4">
                <dt className="text-[var(--ink-muted)]">Sign-in email</dt>
                <dd className="truncate font-bold sm:text-right">
                  {access.email}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <dt className="text-[var(--ink-muted)]">Access level</dt>
              <dd className="font-bold capitalize">{accessLevel}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <dt className="text-[var(--ink-muted)]">Two-step verification</dt>
              <dd className="font-bold">
                {accessLevel === 'admin'
                  ? 'Required and verified'
                  : 'Not required'}
              </dd>
            </div>
          </dl>
          <Link
            href={'/update-password?source=settings' as Route}
            className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--action)] px-5 text-sm font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)]"
          >
            Change password now
          </Link>
          <Link
            href={'/forgot-password' as Route}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 text-sm font-black text-[var(--ink)] transition hover:bg-[var(--surface-hover)]"
          >
            Send a reset email instead
          </Link>

          <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
            <p className="text-sm font-black">After a password change</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
              Every refresh session is revoked and this browser returns to
              sign-in. A short-lived access token on another device may remain
              valid only until its normal expiry.
            </p>
          </div>

          <Link
            href={shell.homeHref}
            className="mt-7 inline-flex min-h-11 items-center text-sm font-black text-[var(--brand-bright)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-current"
          >
            Return home
          </Link>
        </section>
      </div>
    </div>
  )
}
