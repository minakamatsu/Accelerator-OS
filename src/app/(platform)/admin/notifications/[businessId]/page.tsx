import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { retryNotificationAction } from '@/app/(platform)/admin/notifications/actions'
import { NotificationAnalyticsSummary } from '@/components/notifications/notification-analytics-summary'
import { NotificationDateNavigator } from '@/components/notifications/notification-date-navigator'
import { NotificationLogFilters } from '@/components/notifications/notification-report-controls'
import {
  getNotificationDeliveryReport,
  type NotificationDeliveryItem,
} from '@/data/notifications'
import {
  notificationCalendarDates,
  notificationReportingRanges,
  parseNotificationReportingRange,
  type NotificationReportingRange,
} from '@/lib/notifications/reporting'

export const metadata: Metadata = { title: 'Business email analytics' }

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>

const rangeLabels: Record<NotificationReportingRange, string> = {
  '24h': 'Past 24 hours',
  '7d': 'Past 7 days',
  '30d': 'Past 30 days',
}

const statusCopy: Record<
  NotificationDeliveryItem['status'],
  { label: string; className: string }
> = {
  queued: {
    label: 'Queued',
    className: 'border-slate-400/35 bg-slate-400/10 text-slate-200',
  },
  retrying: {
    label: 'Retry scheduled',
    className: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  },
  processing: {
    label: 'Processing',
    className: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
  },
  captured: {
    label: 'Captured locally',
    className: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  },
  provider_accepted: {
    label: 'Accepted by provider',
    className: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  },
  canceled: {
    label: 'Canceled safely',
    className: 'border-violet-400/35 bg-violet-400/10 text-violet-200',
  },
  failed: {
    label: 'Needs attention',
    className: 'border-rose-400/35 bg-rose-400/10 text-rose-200',
  },
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function dateTimeLabel(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(value))
}

function businessReportHref({
  businessId,
  range,
  customerName,
  date,
}: {
  businessId: string
  range: NotificationReportingRange
  customerName?: string
  date?: string
}): Route {
  const params = new URLSearchParams({ range })
  if (customerName) params.set('q', customerName)
  if (date) params.set('date', date)
  return `/admin/notifications/${businessId}?${params.toString()}` as Route
}

export default async function BusinessNotificationAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>
  searchParams: PageSearchParams
}) {
  const [{ businessId }, query] = await Promise.all([params, searchParams])
  if (!z.string().uuid().safeParse(businessId).success) notFound()

  const range = parseNotificationReportingRange(firstValue(query.range))
  const customerName = firstValue(query.q)?.slice(0, 100)
  const parsedDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .safeParse(firstValue(query.date))
  const date = parsedDate.success ? parsedDate.data : undefined
  const report = await getNotificationDeliveryReport({
    range,
    businessId,
    customerName,
    date,
  })
  if (!report.selectedBusiness || !report.selectedCounts) notFound()

  const business = report.selectedBusiness
  const dates = notificationCalendarDates(range, business.timeZone)

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <header className="border-b border-[var(--line)] pb-8">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-strong)] px-4 py-2 text-sm font-black transition hover:border-[var(--brand)]"
          href={`/admin/notifications?range=${range}` as Route}
        >
          <span aria-hidden="true">←</span> All email notifications
        </Link>
        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
              Business email analytics
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              {business.name}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--ink-muted)]">
              Review this business’s website-request email processing and search
              its delivery history.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[var(--line)] bg-[var(--paper-strong)] px-4 py-2 text-sm font-black">
            {report.providerMode === 'development'
              ? 'Development capture — no email sent'
              : 'Resend delivery enabled'}
          </span>
        </div>
      </header>

      <section aria-labelledby="business-overview-title" className="grid gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--brand)] uppercase">
              Business overview
            </p>
            <h2
              className="mt-2 text-2xl font-black tracking-[-0.03em]"
              id="business-overview-title"
            >
              Email activity
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Totals for {rangeLabels[range].toLowerCase()}.
            </p>
          </div>
          <nav
            aria-label="Business notification reporting period"
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
                href={businessReportHref({
                  businessId,
                  range: option,
                  customerName,
                })}
                key={option}
                scroll={false}
              >
                {rangeLabels[option]}
              </Link>
            ))}
          </nav>
        </div>
        <NotificationAnalyticsSummary
          counts={report.selectedCounts}
          label={`${business.name} email totals for ${rangeLabels[range].toLowerCase()}`}
        />
      </section>

      <section
        aria-labelledby="delivery-log-title"
        className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)]"
        id="delivery-log"
      >
        <div className="grid gap-6 border-b border-[var(--line)] p-5 sm:p-8">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
                  Delivery history
                </p>
                <h2
                  className="mt-2 text-2xl font-black tracking-[-0.03em]"
                  id="delivery-log-title"
                >
                  Delivery log
                </h2>
              </div>
              <span className="text-sm font-bold text-[var(--ink-muted)] tabular-nums">
                {report.items.length} matching record
                {report.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">
              Browse dates or search by customer name and exact submitted date
              in {business.timeZone}. “Captured locally” is test evidence only
              and never means a real email was delivered.
            </p>
          </div>

          <NotificationDateNavigator
            businessId={business.id}
            customerName={customerName}
            dates={dates}
            range={range}
            selectedDate={date}
          />

          <div className="border-t border-[var(--line)] pt-6">
            <NotificationLogFilters
              businessId={business.id}
              customerName={customerName}
              date={date}
              range={range}
            />
          </div>

          {report.logLimitReached ? (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-bold text-amber-200">
              This period contains more than 500 records. The newest 500 are
              available in this log.
            </p>
          ) : null}
        </div>

        {report.items.length ? (
          <ul className="divide-y divide-[var(--line)]">
            {report.items.map((item) => {
              const status = statusCopy[item.status]
              return (
                <li
                  className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center"
                  key={item.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-black">{item.customerName}</p>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink-muted)]">
                      Sent to {item.recipientDisplay}
                    </p>
                    {item.errorLabel ? (
                      <p className="mt-2 text-sm font-bold text-[var(--warning)]">
                        {item.errorLabel}
                      </p>
                    ) : null}
                  </div>

                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-bold text-[var(--ink-muted)]">
                        Submitted
                      </dt>
                      <dd className="mt-1 font-bold">
                        {dateTimeLabel(item.createdAt, business.timeZone)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-[var(--ink-muted)]">
                        Attempts
                      </dt>
                      <dd className="mt-1 font-bold tabular-nums">
                        {item.attemptCount} of 4
                      </dd>
                    </div>
                    {item.nextAttemptAt ? (
                      <div className="col-span-2">
                        <dt className="font-bold text-[var(--ink-muted)]">
                          Next automatic attempt
                        </dt>
                        <dd className="mt-1 font-bold">
                          {dateTimeLabel(item.nextAttemptAt, business.timeZone)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {item.status === 'failed' ? (
                    <form action={retryNotificationAction}>
                      <input type="hidden" name="jobId" value={item.id} />
                      <input
                        type="hidden"
                        name="businessId"
                        value={business.id}
                      />
                      <button
                        className="min-h-11 w-full rounded-xl bg-[var(--action)] px-5 py-3 text-sm font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)] lg:w-auto"
                        type="submit"
                      >
                        Retry now
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm font-bold text-[var(--ink-muted)] lg:text-right">
                      {item.status === 'canceled'
                        ? 'No send will occur'
                        : 'No action needed'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-5 sm:p-8">
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-6">
              <p className="font-black">
                {customerName || date
                  ? 'No delivery records match these filters.'
                  : 'No email notifications in this period.'}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
                {customerName || date
                  ? 'Choose another date, clear the filters, or use a different reporting period.'
                  : 'A record will appear after this business website accepts an estimate request.'}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
