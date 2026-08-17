import type { Metadata } from 'next'
import type { Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPipelineBusiness, listPipelineLeads } from '@/data/leads'
import { leadStatusSchema, type LeadStatus } from '@/lib/leads/schemas'
import styles from '@/components/leads/pipeline.module.css'

export const metadata: Metadata = { title: 'Website requests' }

type Props = {
  params: Promise<{ businessId: string }>
  searchParams: Promise<{ status?: string }>
}

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  estimate_sent: 'Estimate sent',
  won: 'Won',
  lost: 'Lost',
}

function money(value: number | null): string {
  return value === null
    ? 'Not recorded'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value / 100)
}

function submittedAt(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default async function LeadPipelinePage({
  params,
  searchParams,
}: Props) {
  const [{ businessId }, query] = await Promise.all([params, searchParams])
  const [business, leads] = await Promise.all([
    getPipelineBusiness(businessId),
    listPipelineLeads(businessId),
  ])
  if (!business) notFound()

  const parsedStatus = leadStatusSchema.safeParse(query.status)
  const selectedStatus = parsedStatus.success ? parsedStatus.data : null
  const visibleLeads = selectedStatus
    ? leads.filter((lead) => lead.status === selectedStatus)
    : leads
  const counts = Object.fromEntries(
    Object.keys(statusLabels).map((status) => [
      status,
      leads.filter((lead) => lead.status === status).length,
    ]),
  ) as Record<LeadStatus, number>
  const inProgressCount = counts.contacted + counts.estimate_sent

  const basePath = `/portal/businesses/${business.id}/leads`

  return (
    <div className={styles.workspace}>
      <header className={styles.pipelineHero}>
        <div>
          <Link href={`/portal/businesses/${business.id}` as Route}>
            ← Dashboard
          </Link>
          <p>Website requests</p>
          <h1>{business.name}</h1>
          <span>
            Estimate requests submitted through this business&apos;s website.
          </span>
        </div>
        <dl aria-label="All-time request metrics">
          <div>
            <dt>Total requests</dt>
            <dd>{leads.length}</dd>
            <small>All website requests</small>
          </div>
          <div>
            <dt>New requests</dt>
            <dd>{counts.new}</dd>
            <small>Not contacted yet</small>
          </div>
          <div>
            <dt>In progress</dt>
            <dd>{inProgressCount}</dd>
            <small>Contacted or estimate sent</small>
          </div>
          <div>
            <dt>Won</dt>
            <dd>{counts.won}</dd>
            <small>Marked as won</small>
          </div>
        </dl>
      </header>

      <section className={styles.pipelineBody} aria-labelledby="pipeline-title">
        <div className={styles.pipelineHeading}>
          <div>
            <p>Submitted details</p>
            <h2 id="pipeline-title">Requests received</h2>
          </div>
          <span>{visibleLeads.length} shown</span>
        </div>

        <nav className={styles.filters} aria-label="Filter requests by status">
          <Link
            href={basePath as Route}
            scroll={false}
            className={!selectedStatus ? styles.activeFilter : undefined}
          >
            All <span>{leads.length}</span>
          </Link>
          {(Object.keys(statusLabels) as LeadStatus[]).map((status) => (
            <Link
              key={status}
              href={`${basePath}?status=${status}` as Route}
              scroll={false}
              className={
                selectedStatus === status ? styles.activeFilter : undefined
              }
            >
              {statusLabels[status]} <span>{counts[status]}</span>
            </Link>
          ))}
        </nav>

        {visibleLeads.length > 0 ? (
          <ol className={styles.leadList}>
            {visibleLeads.map((lead) => (
              <li key={lead.id}>
                <Link href={`${basePath}/${lead.id}` as Route}>
                  <div className={styles.leadIdentity}>
                    <span className={styles[`status_${lead.status}`]}>
                      {statusLabels[lead.status]}
                    </span>
                    <h3>{lead.fullName}</h3>
                    <p>
                      {lead.serviceRequest ?? 'No request summary supplied.'}
                    </p>
                  </div>
                  <dl>
                    <div>
                      <dt>Vehicle</dt>
                      <dd>{lead.vehicleLabel ?? 'Not supplied'}</dd>
                    </div>
                    <div>
                      <dt>Submitted</dt>
                      <dd>{submittedAt(lead.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Estimate</dt>
                      <dd>{money(lead.estimatedValueMinor)}</dd>
                    </div>
                  </dl>
                  <span className={styles.openLead}>Open request →</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.pipelineEmpty}>
            <span>0</span>
            <h3>No requests in this view.</h3>
            <p>
              New website requests will appear here. Try another status filter
              if requests have already been received.
            </p>
            {selectedStatus ? (
              <Link href={basePath as Route}>Show all requests</Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
