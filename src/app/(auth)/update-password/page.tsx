import type { Metadata } from 'next'
import { BrandMark } from '@/components/brand-mark'
import { UpdatePasswordForm } from '@/components/update-password-form'

export const metadata: Metadata = {
  title: 'Choose a new password',
}

export default function UpdatePasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
      <section className="flex flex-col justify-between gap-16 bg-[var(--brand)] p-7 text-white sm:p-12 lg:p-16">
        <BrandMark inverse />
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
            Verified recovery
          </p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[0.98] font-black tracking-[-0.05em] text-balance sm:text-5xl">
            Choose a password built to last.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
            Saving it signs the account out everywhere, including other browsers
            that may still be open.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Recovery session verified by Supabase Auth
        </p>
      </section>

      <section className="surface-grid grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Protect the account
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Set a new password
          </h2>
          <UpdatePasswordForm />
        </div>
      </section>
    </div>
  )
}
