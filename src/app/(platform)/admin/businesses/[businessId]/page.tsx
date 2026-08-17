import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AgencyBusinessDetailsForm,
  AnalyticsConnectionControls,
  BusinessLifecycleControls,
} from '@/components/agency-business-manager'
import { getAgencyBusiness } from '@/data/agency-businesses'
import {
  agencyStatusClasses,
  agencyStatusLabels,
} from '@/lib/agency-business/status-presentation'
import { serverEnv } from '@/lib/env/server'

export const metadata: Metadata = { title: 'Manage business' }

type Props = { params: Promise<{ businessId: string }> }

export default async function ManageAgencyBusinessPage({ params }: Props) {
  const { businessId } = await params
  const business = await getAgencyBusiness(businessId)
  if (!business) notFound()

  const snippet = business.analytics
    ? `<script async src="${serverEnv.APP_URL}/tracker.js?site=${business.analytics.siteKey}"></script>`
    : ''

  return (
    <div className="mx-auto grid max-w-6xl gap-7">
      <Link
        href="/admin"
        className="w-fit text-sm font-black text-[var(--ink-muted)] transition hover:text-[var(--ink)] hover:underline"
      >
        ← Back to client businesses
      </Link>

      <header className="grid gap-5 border-b border-[var(--line)] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
              Business management
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-black tracking-wide uppercase ${agencyStatusClasses[business.status]}`}
            >
              {agencyStatusLabels[business.status]}
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            {business.name}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
            Relationship details, the live website connection, and access to the
            exact performance dashboard the client sees.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link
            href={`/portal/businesses/${business.id}` as Route}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--action)] px-5 py-3 text-sm font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)]"
          >
            View analytics
          </Link>
          {business.websiteUrl ? (
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black text-sky-200 transition hover:bg-sky-400/15"
            >
              Open website ↗
            </a>
          ) : null}
        </div>
      </header>

      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)]">
        <header className="border-b border-[var(--line)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Client record
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Business details
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
            This is your private agency reference. It does not publish or build
            website content.
          </p>
        </header>
        <div className="p-6 sm:p-8">
          <AgencyBusinessDetailsForm business={business} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)]">
        <header className="border-b border-[var(--line)] bg-[linear-gradient(120deg,rgba(216,242,63,0.12),transparent_55%)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Website analytics
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Connect the live website
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
            The publishable key identifies this connection; the server also
            requires the event to come from the saved website hostname.
          </p>
        </header>
        <div className="p-6 sm:p-8">
          <AnalyticsConnectionControls business={business} snippet={snippet} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)]">
        <header className="border-b border-[var(--line)] p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Roster status
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Activate, pause, or archive
          </h2>
        </header>
        <div className="p-6 sm:p-8">
          <BusinessLifecycleControls business={business} />
        </div>
      </section>
    </div>
  )
}
