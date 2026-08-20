import type { Metadata } from 'next'
import { BrandMark } from '@/components/brand-mark'
import { UpdatePasswordForm } from '@/components/update-password-form'
import { requireAuthenticatedUser } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: 'Choose a new password',
}

type Props = {
  searchParams: Promise<{ source?: string }>
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { source } = await searchParams
  const fromSettings = source === 'settings'
  if (fromSettings) await requireAuthenticatedUser()

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
      <section className="flex flex-col justify-between gap-16 border-b border-[var(--line)] bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-12 lg:border-r lg:border-b-0 lg:p-16">
        <BrandMark inverse />
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
            {fromSettings ? 'Protected account settings' : 'Verified recovery'}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[0.98] font-black tracking-[-0.05em] text-balance sm:text-5xl">
            {fromSettings
              ? 'Replace the password you no longer want to use.'
              : 'Choose a password built to last.'}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--ink-muted)]">
            Saving signs the account out everywhere and removes this browser’s
            authenticated session.
          </p>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">
          {fromSettings
            ? 'Current signed-in session verified by Supabase Auth'
            : 'Recovery session verified by Supabase Auth'}
        </p>
      </section>

      <section className="surface-grid grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            {fromSettings ? 'Rotate the credential' : 'Protect the account'}
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Set a new password
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            Accelerator OS never receives a readable copy back from Supabase
            after you save it.
          </p>
          <UpdatePasswordForm source={fromSettings ? 'settings' : 'recovery'} />
        </div>
      </section>
    </div>
  )
}
