import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BrandMark } from '@/components/brand-mark'
import { MfaGate } from '@/components/mfa-gate'
import { getPrimaryAccessContext } from '@/lib/auth/guards'
import { safeNextPath } from '@/lib/auth/safe-next-path'

export const metadata: Metadata = {
  title: 'Two-step verification',
}

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function MfaPage({ searchParams }: Props) {
  const access = await getPrimaryAccessContext()
  const { next } = await searchParams
  const nextPath = safeNextPath(next, '/admin')

  if (access.mode === 'development') redirect('/sign-in')
  if (access.platformRole !== 'admin') redirect('/portal')
  if (access.assuranceLevel === 'aal2') redirect(nextPath)

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
      <section className="flex flex-col justify-between gap-16 bg-[#07100e] p-7 text-white sm:p-12 lg:p-16">
        <BrandMark inverse />
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
            Administrator protection
          </p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[0.98] font-black tracking-[-0.05em] text-balance sm:text-5xl">
            A password alone is not enough here.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
            Agency access spans every client. A second factor prevents a stolen
            password from becoming a tenant-wide breach.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Required for every administrator session
        </p>
      </section>

      <section className="surface-grid grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Two-step verification
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Secure administrator access
          </h2>
          <p className="mt-3 leading-7 text-[var(--ink-muted)]">
            {access.email
              ? `Signed in as ${access.email}`
              : 'Complete verification to continue.'}
          </p>
          <MfaGate nextPath={nextPath} />
        </div>
      </section>
    </div>
  )
}
