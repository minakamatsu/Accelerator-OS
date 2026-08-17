import type { Route } from 'next'
import Link from 'next/link'
import type { AgencyBusiness } from '@/data/agency-businesses'
import {
  agencyStatusClasses,
  agencyStatusLabels,
  agencyStatusRowClasses,
} from '@/lib/agency-business/status-presentation'

function locationLabel(business: AgencyBusiness) {
  return (
    [business.city, business.region].filter(Boolean).join(', ') ||
    'Location not added'
  )
}

function analyticsStatusClasses(status?: string) {
  if (status === 'connected') {
    return 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
  }
  if (status === 'pending') {
    return 'border-sky-400/35 bg-sky-400/10 text-sky-200'
  }
  return 'border-slate-400/30 bg-slate-400/10 text-slate-300'
}

export function AgencyBusinessRoster({
  businesses,
}: {
  businesses: AgencyBusiness[]
}) {
  const active = businesses.filter((business) => business.status !== 'archived')
  const archived = businesses.filter(
    (business) => business.status === 'archived',
  )

  return (
    <div className="grid gap-6">
      <section
        aria-labelledby="business-roster-title"
        className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)]"
      >
        <header className="border-b border-[var(--line)] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
                Client businesses
              </p>
              <h2
                id="business-roster-title"
                className="mt-2 text-2xl font-black tracking-[-0.03em]"
              >
                {active.length} on your roster
              </h2>
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              {
                businesses.filter((business) => business.status === 'active')
                  .length
              }{' '}
              active
            </p>
          </div>
        </header>
        {active.length ? (
          <ul className="divide-y divide-[var(--line)]">
            {active.map((business) => (
              <li
                key={business.id}
                className={`grid gap-5 p-6 sm:p-8 ${agencyStatusRowClasses[business.status]}`}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black tracking-[-0.025em]">
                        {business.name}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-black tracking-wide uppercase ${agencyStatusClasses[business.status]}`}
                      >
                        {agencyStatusLabels[business.status]}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-black tracking-wide uppercase ${analyticsStatusClasses(business.analytics?.status)}`}
                      >
                        Analytics {business.analytics?.status ?? 'disconnected'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--ink-muted)]">
                      <span>{locationLabel(business)}</span>
                      <span>
                        {business.contactName ?? 'Client contact not added'}
                      </span>
                      <span className="truncate">
                        {business.analytics?.allowedHostname ??
                          'Website not connected'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                    <Link
                      href={`/portal/businesses/${business.id}` as Route}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--action)] px-4 py-2 text-sm font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)]"
                    >
                      View analytics
                    </Link>
                    <Link
                      href={`/admin/businesses/${business.id}` as Route}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 py-2 text-sm font-black transition hover:bg-[var(--control-hover)]"
                    >
                      Manage
                    </Link>
                    {business.websiteUrl ? (
                      <a
                        href={business.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-400/15"
                      >
                        Open website ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-sm leading-6 text-[var(--ink-muted)]">
            No active businesses yet. Add the first client below.
          </p>
        )}
      </section>

      {archived.length ? (
        <details className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper-strong)] p-5">
          <summary className="cursor-pointer font-black">
            Archived businesses ({archived.length})
          </summary>
          <ul className="mt-4 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {archived.map((business) => (
              <li
                key={business.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black">{business.name}</p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Data preserved · tracking disabled
                  </p>
                </div>
                <Link
                  href={`/admin/businesses/${business.id}` as Route}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 text-sm font-black text-violet-200 transition hover:bg-violet-400/15"
                >
                  Review or restore
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
