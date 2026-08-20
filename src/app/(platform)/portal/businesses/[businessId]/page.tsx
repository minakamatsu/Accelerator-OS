import type { CSSProperties } from 'react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClientDashboard } from '@/data/client-dashboard'
import {
  analyticsRangeLabel,
  analyticsRanges,
  parseAnalyticsRange,
  type AnalyticsRange,
  type AnalyticsBreakdown,
} from '@/lib/analytics/dashboard'
import { ActivityTrendChart } from './activity-trend-chart'
import { RefreshDataButton } from './refresh-data-button'
import styles from './dashboard.module.css'

export const metadata: Metadata = { title: 'Website performance' }

type Props = {
  params: Promise<{ businessId: string }>
  searchParams: Promise<{ range?: string }>
}

type ProgressStyle = CSSProperties & { '--progress': string }

const metricDefinitions = {
  visitors:
    'Different anonymous browser identifiers recorded during this period. No raw IP address or cross-business identifier is stored.',
  views:
    'Recorded views of your public website pages. One visitor can view several pages. Agency preview mode is excluded.',
  requests:
    'Estimate-request forms accepted through your website. A request is not yet an estimate or booked job.',
  actionRate:
    'The share of identified visitors who recorded at least one phone, directions, contact, or accepted estimate-request action.',
}

function periodLabel(range: AnalyticsRange, start: string, end: Date): string {
  if (range === 1) return 'Past 24 hours'
  const format = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${format.format(new Date(start))}–${format.format(end)}`
}

function comparisonLabel(
  change: number | null,
  previous: number,
  range: AnalyticsRange,
): string {
  const previousPeriod =
    range === 1 ? 'the previous 24 hours' : `the previous ${range} days`
  if (change === null) {
    return previous === 0
      ? `No visitors in ${previousPeriod}`
      : 'Comparison unavailable'
  }
  if (change === 0) return `No change from ${previousPeriod}`
  const direction = change > 0 ? 'more' : 'fewer'
  return `${Math.abs(change)}% ${direction} than ${previousPeriod}`
}

function MetricCard({
  label,
  value,
  note,
  definition,
}: {
  label: string
  value: string | number
  note: string
  definition: string
}) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabel}>
        <h2>{label}</h2>
        <details>
          <summary aria-label={`Explain ${label}`}>i</summary>
          <p>{definition}</p>
        </details>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function BreakdownCard({
  eyebrow,
  title,
  emptyMessage,
  items,
  unit,
}: {
  eyebrow: string
  title: string
  emptyMessage: string
  items: AnalyticsBreakdown[]
  unit: string
}) {
  return (
    <article className={styles.insightCard}>
      <div className={styles.insightHeading}>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {items.length ? (
        <ol className={styles.breakdownList}>
          {items.map((item) => (
            <li key={`${item.label}-${item.detail ?? ''}`}>
              <div className={styles.breakdownCopy}>
                <div>
                  <strong>{item.label}</strong>
                  {item.detail ? <small>{item.detail}</small> : null}
                </div>
                <span>
                  {item.count}{' '}
                  {item.count === 1 && unit.endsWith('s')
                    ? unit.slice(0, -1)
                    : unit}
                </span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <i
                  style={
                    { '--progress': `${item.percentage}%` } as ProgressStyle
                  }
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.cardEmpty}>{emptyMessage}</p>
      )}
    </article>
  )
}

export default async function ClientBusinessDashboard({
  params,
  searchParams,
}: Props) {
  const [{ businessId }, query] = await Promise.all([params, searchParams])
  const days = parseAnalyticsRange(query.range)
  const dashboard = await getClientDashboard(businessId, days)
  if (!dashboard) notFound()

  const { business, metrics } = dashboard
  const basePath = `/portal/businesses/${business.id}`
  const actionRows = [
    {
      label: 'Estimate requests',
      value: metrics.estimateRequests,
      note: 'Accepted website forms',
    },
    {
      label: 'Phone clicks',
      value: metrics.phoneClicks,
      note: 'Phone links pressed',
    },
    {
      label: 'Directions clicks',
      value: metrics.directionsClicks,
      note: 'Directions links pressed',
    },
    {
      label: 'Contact clicks',
      value: metrics.contactClicks,
      note: 'Email links pressed',
    },
  ]

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <p>Website performance</p>
          <h1>{business.name}</h1>
          <span>
            A clear view of who visited, what they viewed, and which actions
            they took.
          </span>
        </div>
        <div className={styles.headerActions}>
          <RefreshDataButton />
          <a
            href={
              business.websiteUrl ??
              `/portal/businesses/${business.id}/website-preview`
            }
            target={business.websiteUrl ? '_blank' : undefined}
            rel={business.websiteUrl ? 'noreferrer' : undefined}
            className={styles.websiteButton}
          >
            {business.websiteUrl ? 'Open website ↗' : 'View website'}
          </a>
        </div>
      </header>

      <section className={styles.rangeRow} aria-label="Performance date range">
        <div>
          <p>Showing</p>
          <strong>{periodLabel(days, metrics.rangeStart, new Date())}</strong>
        </div>
        <nav aria-label="Select date range">
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

      <section className={styles.metrics} aria-label="Website overview">
        <MetricCard
          label="Unique visitors"
          value={metrics.uniqueVisitors}
          note={comparisonLabel(
            metrics.visitorChangePercent,
            metrics.previousUniqueVisitors,
            days,
          )}
          definition={metricDefinitions.visitors}
        />
        <MetricCard
          label="Website page views"
          value={metrics.pageViews}
          note="Public pages viewed"
          definition={metricDefinitions.views}
        />
        <MetricCard
          label="Estimate requests"
          value={metrics.estimateRequests}
          note="Forms received"
          definition={metricDefinitions.requests}
        />
        <MetricCard
          label="Visitor action rate"
          value={metrics.actionRate === null ? '—' : `${metrics.actionRate}%`}
          note={
            metrics.actionRate === null
              ? 'No identified visitors in this period'
              : 'Visitors who took a tracked action'
          }
          definition={metricDefinitions.actionRate}
        />
      </section>

      <section className={styles.trendCard} aria-labelledby="activity-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>Activity over time</p>
            <h2 id="activity-title">Website activity trend</h2>
          </div>
          <span className={styles.chartHint}>
            Choose a metric, then hover or focus a point for details.
          </span>
        </div>

        {metrics.pageViews + metrics.highIntentActions > 0 ? (
          <ActivityTrendChart
            trend={metrics.trend}
            totals={{
              pageViews: metrics.pageViews,
              uniqueVisitors: metrics.uniqueVisitors,
              highIntentActions: metrics.highIntentActions,
            }}
          />
        ) : (
          <div className={styles.noActivity}>
            <strong>No website activity recorded for this period.</strong>
            <p>
              Visitors, page views, estimate requests, and tracked button
              presses will appear here as people use the public website.
            </p>
          </div>
        )}
      </section>

      <section className={styles.actionsCard} aria-labelledby="actions-title">
        <div className={styles.actionsIntro}>
          <div>
            <p>High-intent actions</p>
            <h2 id="actions-title">What visitors tried to do</h2>
            <span>
              These are recorded button presses and accepted forms—not proof of
              a completed call, visit, or booked job.
            </span>
          </div>
          <div className={styles.actionTotal}>
            <strong>{metrics.highIntentActions}</strong>
            <span>Total actions</span>
          </div>
        </div>
        <div className={styles.actionGrid}>
          {actionRows.map((action) => (
            <article key={action.label}>
              <span>{action.label}</span>
              <strong>{action.value}</strong>
              <small>{action.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.insightGrid} aria-label="Visitor insights">
        <BreakdownCard
          eyebrow="Content"
          title="Top pages"
          emptyMessage="Page popularity will appear after public visits are recorded."
          items={metrics.topPages}
          unit="views"
        />
        <BreakdownCard
          eyebrow="Discovery"
          title="Traffic sources"
          emptyMessage="Traffic sources will appear after identified visitors arrive."
          items={metrics.trafficSources}
          unit="visitors"
        />
        <BreakdownCard
          eyebrow="Devices"
          title="How visitors viewed the site"
          emptyMessage="Device categories will appear after identified visits are recorded."
          items={metrics.devices}
          unit="visitors"
        />
      </section>
    </div>
  )
}
