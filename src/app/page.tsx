import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { ArrowIcon } from '@/components/icons'

const surfaces = [
  {
    eyebrow: 'Agency workspace',
    title: 'Operate every account from one place.',
    description:
      'Onboard businesses, review readiness, and watch the lead system without repeating the setup work.',
    href: '/admin' as const,
    label: 'Open admin shell',
  },
  {
    eyebrow: 'Client workspace',
    title: 'Keep the lead handoff simple.',
    description:
      'A focused portal for client teams to respond, update outcomes, and understand recorded performance.',
    href: '/portal' as const,
    label: 'Open portal shell',
  },
  {
    eyebrow: 'Public experience',
    title: 'Preview the site delivery surface.',
    description:
      'Business facts and an original design will appear here after the onboarding approval gate.',
    href: '/site/pilot-auto' as const,
    label: 'Open site shell',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5 sm:px-9">
          <BrandMark />
          <Link
            href="/sign-in"
            className="rounded-full border border-[var(--ink)] px-4 py-2 text-sm font-bold transition-colors hover:bg-[var(--ink)] hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <section className="surface-grid grid flex-1 items-stretch overflow-hidden rounded-b-[2rem] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-between gap-16 border-b border-[var(--line)] p-7 sm:p-12 lg:border-r lg:border-b-0 lg:p-16">
            <div>
              <p className="mb-6 inline-flex rounded-full bg-[var(--signal)] px-3 py-1 text-xs font-black tracking-[0.14em] uppercase">
                Tenant foundation · Milestone 2
              </p>
              <h1 className="max-w-4xl text-5xl leading-[0.96] font-black tracking-[-0.055em] text-balance sm:text-7xl">
                Turn repeat work into a dependable system.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
                Accelerator OS is the internal control room for launching and
                operating lead-capture systems for local automotive businesses.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-[var(--ink-muted)]">
              <span>Verified business facts</span>
              <span>Tenant-safe by design</span>
              <span>Recorded outcomes</span>
            </div>
          </div>

          <div className="grid divide-y divide-[var(--line)] bg-white/70">
            {surfaces.map((surface, index) => (
              <article
                key={surface.title}
                className="group flex gap-5 p-7 sm:p-9"
              >
                <span className="pt-1 font-mono text-xs font-bold text-[var(--brand-bright)]">
                  0{index + 1}
                </span>
                <div className="flex flex-1 flex-col">
                  <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
                    {surface.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl leading-tight font-black tracking-[-0.025em]">
                    {surface.title}
                  </h2>
                  <p className="mt-3 max-w-xl leading-7 text-[var(--ink-muted)]">
                    {surface.description}
                  </p>
                  <Link
                    href={surface.href}
                    className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-black text-[var(--brand)]"
                  >
                    {surface.label}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
