import type { Metadata } from 'next'
import { BrandMark } from '@/components/brand-mark'
import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = {
  title: 'Reset password',
}

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured()

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
      <section className="flex flex-col justify-between gap-16 bg-[var(--brand)] p-7 text-white sm:p-12 lg:p-16">
        <BrandMark inverse />
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
            Account recovery
          </p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[0.98] font-black tracking-[-0.05em] text-balance sm:text-5xl">
            Get back in without involving the agency.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
            A time-limited link verifies control of the account email before a
            password can be changed.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Private by design · No account details are disclosed
        </p>
      </section>

      <section className="surface-grid grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Reset access
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Forgot your password?
          </h2>
          <p className="mt-3 leading-7 text-[var(--ink-muted)]">
            Enter the email attached to your agency-issued account.
          </p>
          <ForgotPasswordForm configured={configured} />
        </div>
      </section>
    </div>
  )
}
