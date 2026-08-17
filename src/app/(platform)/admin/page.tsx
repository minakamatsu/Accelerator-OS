import type { Metadata } from 'next'
import { AgencyBusinessRoster } from '@/components/agency-business-roster'
import { NewBusinessForm } from '@/components/onboarding/new-business-form'
import { listAgencyBusinesses } from '@/data/agency-businesses'
import { requirePlatformAdmin } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: 'Client businesses',
}

export default async function AdminPage() {
  await requirePlatformAdmin()
  const businesses = await listAgencyBusinesses()

  return (
    <div className="mx-auto grid max-w-7xl gap-7">
      <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Agency workspace
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            Client businesses
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
            Keep the relationship details, website connection, and performance
            reporting in one place. Website building stays in your separate
            production workflow.
          </p>
        </div>
        <a
          href="#add-business"
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2.5 self-start rounded-full border border-[#315f53] bg-[#102a24] px-4 py-2.5 text-sm font-black whitespace-nowrap text-[var(--brand-bright)] shadow-[0_10px_24px_rgb(0_0_0/0.18)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[#17382f] motion-reduce:hover:translate-y-0 sm:self-auto"
        >
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-[var(--signal)] text-base leading-none text-[var(--signal-ink)]"
          >
            +
          </span>
          Add business
        </a>
      </header>

      <AgencyBusinessRoster businesses={businesses} />

      <section
        id="add-business"
        aria-labelledby="new-business-title"
        className="scroll-mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)]"
      >
        <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,rgba(216,242,63,0.15),transparent_58%)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Add client
          </p>
          <h2
            id="new-business-title"
            className="mt-2 text-2xl font-black tracking-[-0.03em]"
          >
            Add the essentials.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
            Start with what you already know. You can save the website address,
            contact, and location now or finish them later.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <NewBusinessForm />
        </div>
      </section>
    </div>
  )
}
