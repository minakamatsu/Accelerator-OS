import type { Metadata } from 'next'
import Link from 'next/link'
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
          Review your access level and the workspace preferences available on
          this device.
        </p>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Profile
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            {shell.roleLabel}
          </h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <dt className="text-[var(--ink-muted)]">Access level</dt>
              <dd className="font-bold capitalize">{accessLevel}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
              <dt className="text-[var(--ink-muted)]">Default home</dt>
              <dd className="font-bold">
                {shell.homeHref === '/admin'
                  ? 'Agency overview'
                  : 'Website performance'}
              </dd>
            </div>
          </dl>
          <Link
            href={shell.homeHref}
            className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand)]"
          >
            Return home
          </Link>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Workspace preferences
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Sidebar display
          </h2>
          <p className="mt-4 leading-7 text-[var(--ink-muted)]">
            Use the arrow beside the Accelerator OS logo to collapse or expand
            the desktop sidebar. Your preference is remembered on this device.
          </p>
          <div className="mt-7 rounded-xl bg-[#edf0e9] p-4 text-sm leading-6 text-[var(--ink-muted)]">
            Account identity, role changes, and password recovery remain managed
            through secure authentication and agency access controls.
          </div>
        </section>
      </div>
    </div>
  )
}
