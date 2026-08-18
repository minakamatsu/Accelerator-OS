import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { SignInForm } from '@/components/sign-in-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = {
  title: 'Sign in',
}

type Props = {
  searchParams: Promise<{ next?: string; notice?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const configured = isSupabaseConfigured()
  const { next, notice, error } = await searchParams
  const nextPath =
    next?.startsWith('/') && !next.startsWith('//') ? next : '/portal'

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.78fr_1.22fr]">
      <section className="flex flex-col justify-between gap-16 bg-[var(--brand)] p-7 text-white sm:p-12 lg:p-16">
        <BrandMark inverse />
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
            Controlled access
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-none font-black tracking-[-0.05em] text-balance">
            One workspace. The right view for every role.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Authentication and role enforcement use verified Supabase sessions
            when the local or hosted service is configured.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Internal agency system · No public signup
        </p>
      </section>

      <section className="surface-grid grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black tracking-wide text-amber-900 uppercase">
            {configured ? 'Secure access' : 'Development preview'}
          </p>
          <h2 className="mt-6 text-3xl font-black tracking-[-0.035em]">
            Sign in
          </h2>
          <p className="mt-2 leading-7 text-[var(--ink-muted)]">
            {configured
              ? 'Use an agency-issued account. Public signup is disabled.'
              : 'Supabase Auth is not configured in this environment.'}
          </p>
          {notice === 'password-updated' ? (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm leading-6 font-bold text-emerald-900">
              Your password was changed and other sessions were signed out. Use
              the new password to continue.
            </p>
          ) : null}
          {error === 'invalid-link' ? (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 font-bold text-red-900">
              That secure link is invalid or expired. Request a new password
              reset link.
            </p>
          ) : null}
          <SignInForm configured={configured} nextPath={nextPath} />
          <Link
            href="/"
            className="mt-8 inline-flex text-sm font-black text-[var(--brand)]"
          >
            ← Return to overview
          </Link>
        </div>
      </section>
    </div>
  )
}
