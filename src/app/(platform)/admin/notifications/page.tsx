import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { NotificationAnalyticsSummary } from '@/components/notifications/notification-analytics-summary'
import { NotificationBusinessDirectory } from '@/components/notifications/notification-business-directory'
import { getNotificationDeliveryReport } from '@/data/notifications'
import {
  notificationReportingRanges,
  parseNotificationReportingRange,
  type NotificationReportingRange,
} from '@/lib/notifications/reporting'

export const metadata: Metadata = { title: 'Email notifications' }

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>

const rangeLabels: Record<NotificationReportingRange, string> = {
  '24h': 'Past 24 hours',
  '7d': 'Past 7 days',
  '30d': 'Past 30 days',
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function overviewHref(range: NotificationReportingRange): Route {
  return `/admin/notifications?range=${range}` as Route
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: PageSearchParams
}) {
  const query = await searchParams
  const range = parseNotificationReportingRange(firstValue(query.range))
  const legacyBusinessId = z
    .string()
    .uuid()
    .safeParse(firstValue(query.business))
  if (legacyBusinessId.success) {
    redirect(
      `/admin/notifications/${legacyBusinessId.data}?range=${range}` as Route,
    )
  }

  const report = await getNotificationDeliveryReport({ range })

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
            Agency operations
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            Email notifications
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--ink-muted)]">
            Review agency-wide email processing, then open a business for its
            individual analytics and delivery history.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--line)] bg-[var(--paper-strong)] px-4 py-2 text-sm font-black">
          {report.providerMode === 'development'
            ? 'Development capture — no email sent'
            : 'Resend delivery enabled'}
        </span>
      </header>

      <section aria-labelledby="agency-overview-title" className="grid gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--brand)] uppercase">
              General analytics
            </p>
            <h2
              className="mt-2 text-2xl font-black tracking-[-0.03em]"
              id="agency-overview-title"
            >
              All businesses
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Combined totals for {rangeLabels[range].toLowerCase()}.
            </p>
          </div>
          <nav
            aria-label="Notification reporting period"
            className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto"
          >
            {notificationReportingRanges.map((option) => (
              <Link
                aria-current={option === range ? 'page' : undefined}
                className={`min-h-11 shrink-0 rounded-full border px-4 py-2.5 text-sm font-black transition ${
                  option === range
                    ? 'border-[var(--action)] bg-[var(--action)] text-[var(--action-text)]'
                    : 'border-[var(--line)] bg-[var(--paper-strong)] hover:border-[var(--brand)]'
                }`}
                href={overviewHref(option)}
                key={option}
                scroll={false}
              >
                {rangeLabels[option]}
              </Link>
            ))}
          </nav>
        </div>
        <NotificationAnalyticsSummary
          counts={report.agencyCounts}
          label={`Agency email totals for ${rangeLabels[range].toLowerCase()}`}
        />
      </section>

      <section
        aria-labelledby="business-directory-title"
        className="grid gap-5"
      >
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[var(--brand)] uppercase">
            Business directory
          </p>
          <h2
            className="mt-2 text-2xl font-black tracking-[-0.03em]"
            id="business-directory-title"
          >
            Choose a business
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">
            Every business is listed below. Search by name, then click a card to
            open that business’s separate email analytics page.
          </p>
        </div>
        {report.businesses.length ? (
          <NotificationBusinessDirectory
            businesses={report.businesses}
            range={range}
          />
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--paper-strong)] p-6">
            <p className="font-black">No businesses have been added yet.</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Add a business from Client businesses before reviewing its email
              analytics.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
