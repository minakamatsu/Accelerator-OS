import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWebsiteLeadReport } from '@/data/leads'
import {
  analyticsRangeLabel,
  analyticsRanges,
  parseAnalyticsRange,
} from '@/lib/analytics/dashboard'
import { filterWebsiteLeadReportItems } from '@/lib/leads/report'
import { LeadTrendChart } from './lead-trend-chart'
import styles from './report.module.css'

export const metadata: Metadata = { title: 'Website leads' }

type Props = {
  params: Promise<{ businessId: string }>
  searchParams: Promise<{
    range?: string
    query?: string
    date?: string
  }>
}

function displayDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(value))
}

function contactSummary(email: string | null, phone: string | null) {
  if (email && phone) return `${email} · ${phone}`
  return email ?? phone ?? 'No contact detail stored'
}

export default async function WebsiteLeadReportPage({
  params,
  searchParams,
}: Props) {
  const [{ businessId }, query] = await Promise.all([params, searchParams])
  const days = parseAnalyticsRange(query.range)
  const report = await getWebsiteLeadReport(businessId, days)
  if (!report) notFound()

  const searchQuery = query.query?.trim().slice(0, 120) ?? ''
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? '')
    ? query.date
    : undefined
  const visibleLeads = filterWebsiteLeadReportItems(report.leads, {
    query: searchQuery,
    date: selectedDate,
    timeZone: report.business.timeZone,
  })
  const basePath = `/portal/businesses/${report.business.id}/leads`
  const hasFilters = Boolean(searchQuery || selectedDate)

  return (
    <main className={styles.report}>
      <header className={styles.header}>
        <div>
          <p>Website leads</p>
          <h1>Quote requests in one clear list.</h1>
          <span>
            People who submitted the request form on {report.business.name}
            &apos;s website. This records the inquiry—not a completed estimate
            or booked job.
          </span>
        </div>
        <Link
          href={`/portal/businesses/${report.business.id}` as Route}
          className={styles.dashboardLink}
        >
          Back to dashboard
        </Link>
      </header>

      <section className={styles.rangeRow} aria-label="Lead reporting period">
        <div>
          <p>Received in this period</p>
          <strong>{report.leads.length}</strong>
          <span>
            {report.leads.length === 1 ? 'website lead' : 'website leads'}
          </span>
        </div>
        <nav aria-label="Select lead date range">
          {analyticsRanges.map((range) => (
            <Link
              key={range}
              href={`${basePath}?range=${range}` as Route}
              scroll={false}
              aria-current={days === range ? 'page' : undefined}
            >
              {analyticsRangeLabel(range)}
            </Link>
          ))}
        </nav>
      </section>

      <section className={styles.trendCard} aria-labelledby="lead-trend-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>Leads over time</p>
            <h2 id="lead-trend-title">Request volume</h2>
          </div>
          <span>All requests in the selected period</span>
        </div>

        {report.leads.length > 0 ? (
          <LeadTrendChart trend={report.trend} />
        ) : (
          <div className={styles.chartEmpty}>
            <strong>No quote requests in this period.</strong>
            <p>New website form submissions will appear here automatically.</p>
          </div>
        )}
      </section>

      <section
        id="lead-list"
        className={styles.leadCard}
        aria-labelledby="lead-list-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p>Lead list</p>
            <h2 id="lead-list-title">Submitted requests</h2>
          </div>
          <span aria-live="polite">
            {visibleLeads.length} {visibleLeads.length === 1 ? 'row' : 'rows'}
          </span>
        </div>

        <form
          className={styles.filters}
          method="get"
          action={`${basePath}#lead-list`}
        >
          <input type="hidden" name="range" value={days} />
          <label>
            <span>Search leads</span>
            <input
              type="search"
              name="query"
              defaultValue={searchQuery}
              maxLength={120}
              placeholder="Name, phone, email, vehicle, or request"
            />
          </label>
          <label>
            <span>Submitted on</span>
            <input type="date" name="date" defaultValue={selectedDate} />
          </label>
          <button type="submit">Search</button>
          {hasFilters ? (
            <Link href={`${basePath}?range=${days}` as Route} scroll={false}>
              Clear filters
            </Link>
          ) : null}
        </form>

        {visibleLeads.length > 0 ? (
          <div className={styles.tableScroll}>
            <table>
              <caption>
                Website quote requests for {report.business.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Submitted</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Request</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td data-label="Submitted">
                      {displayDate(lead.createdAt, report.business.timeZone)}
                    </td>
                    <td data-label="Customer">
                      <strong>{lead.fullName}</strong>
                    </td>
                    <td data-label="Contact">
                      {contactSummary(lead.email, lead.phone)}
                    </td>
                    <td data-label="Vehicle">
                      {lead.vehicleLabel ?? 'Not supplied'}
                    </td>
                    <td data-label="Request">
                      <strong>{lead.serviceRequest}</strong>
                      {lead.message ? <small>{lead.message}</small> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.tableEmpty}>
            <strong>
              {hasFilters
                ? 'No leads match these filters.'
                : 'No website leads in this period.'}
            </strong>
            <p>
              {hasFilters
                ? 'Try a different name, contact detail, vehicle, request, or date.'
                : 'Accepted quote-request forms will be listed here.'}
            </p>
            {hasFilters ? (
              <Link href={`${basePath}?range=${days}` as Route} scroll={false}>
                Show every lead in this period
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}
