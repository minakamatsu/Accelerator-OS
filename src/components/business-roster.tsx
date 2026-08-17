import type { AccessibleBusiness } from '@/data/businesses'
import type { Route } from 'next'
import Link from 'next/link'

export function BusinessRoster({
  businesses,
  eyebrow,
  showManage = false,
  showPreview = false,
}: {
  businesses: AccessibleBusiness[]
  eyebrow: string
  showManage?: boolean
  showPreview?: boolean
}) {
  return (
    <section
      aria-labelledby="business-roster-title"
      className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)]"
    >
      <div className="border-b border-[var(--line)] p-6 sm:p-8">
        <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
          {eyebrow}
        </p>
        <h2
          id="business-roster-title"
          className="mt-2 text-2xl font-black tracking-[-0.03em]"
        >
          Accessible businesses
        </h2>
      </div>
      <ul className="divide-y divide-[var(--line)]">
        {businesses.map((business) => (
          <li
            key={business.id}
            className="flex items-center justify-between gap-5 p-6 sm:p-8"
          >
            <div>
              <p className="font-black">{business.name}</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                /{business.slug}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-black tracking-wide uppercase">
                {business.status}
              </span>
              {showManage ? (
                <Link
                  href={`/admin/businesses/${business.id}/onboarding` as Route}
                  className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-black text-white transition hover:bg-[var(--brand)]"
                >
                  Onboard
                </Link>
              ) : null}
              {showPreview ? (
                <a
                  href={`/portal/businesses/${business.id}/website-preview`}
                  className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--ink)] transition hover:border-[var(--brand)]"
                >
                  Preview website
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
