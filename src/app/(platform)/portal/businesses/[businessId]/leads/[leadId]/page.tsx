import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InfoTip } from '@/components/leads/info-tip'
import { LeadActionPanel } from '@/components/leads/lead-actions'
import styles from '@/components/leads/pipeline.module.css'
import { getLeadDetail, getPipelineBusiness } from '@/data/leads'
import type { LeadStatus } from '@/lib/leads/schemas'
import { addLeadNote, updateLeadStatus, updateLeadValues } from '../actions'

export const metadata: Metadata = { title: 'Website request details' }

type Props = { params: Promise<{ businessId: string; leadId: string }> }

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  estimate_sent: 'Estimate sent',
  won: 'Won',
  lost: 'Lost',
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function eventLabel(value: string): string {
  return value
    .replace(/^lead\./, '')
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

function sourceLabel(value: string | null): string {
  if (!value) return 'Not recorded'
  if (value === 'website_quote') return 'Website estimate-request form'
  return value
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

function deliveryStatusLabel(value: string): string {
  if (value === 'captured') return 'Development record'
  return value
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

function providerLabel(value: string): string {
  return value === 'development' ? 'Development mode' : value
}

export default async function LeadDetailPage({ params }: Props) {
  const { businessId, leadId } = await params
  const [business, lead] = await Promise.all([
    getPipelineBusiness(businessId),
    getLeadDetail(businessId, leadId),
  ])
  if (!business || !lead) notFound()

  const basePath = `/portal/businesses/${businessId}/leads`
  const statusAction = updateLeadStatus.bind(null, businessId, leadId)
  const valueAction = updateLeadValues.bind(null, businessId, leadId)
  const noteAction = addLeadNote.bind(null, businessId, leadId)

  return (
    <div className={styles.workspace}>
      <header className={styles.detailHero}>
        <Link href={basePath as Route}>← Back to website requests</Link>
        <div>
          <span className={styles[`status_${lead.status}`]}>
            {statusLabels[lead.status]}
          </span>
          <p>Submitted {dateTime(lead.createdAt)}</p>
        </div>
        <h1>{lead.fullName}</h1>
        <p>{lead.serviceRequest ?? 'No request summary supplied.'}</p>
        <dl>
          <div>
            <dt>Phone</dt>
            <dd>
              {lead.phone ? (
                <a href={`tel:${lead.phone}`}>{lead.phone}</a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {lead.email ? (
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>{lead.vehicleLabel ?? 'Not supplied'}</dd>
          </div>
          <div>
            <dt>Came from</dt>
            <dd>{sourceLabel(lead.source)}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <section className={styles.requestCard}>
            <div className={styles.cardHeading}>
              <p>Customer request</p>
              <InfoTip label="Explain customer request">
                This is the information the customer submitted through the
                website. It is kept separate from your team&apos;s private
                notes.
              </InfoTip>
            </div>
            <blockquote>
              {lead.serviceRequest ?? 'No request supplied.'}
            </blockquote>
            {lead.message ? <p>{lead.message}</p> : null}
          </section>

          <details className={styles.optionalTracking}>
            <summary>
              <span>Optional internal tracking</span>
              <strong>Status, job value, and private notes</strong>
            </summary>
            <p>
              You do not need to update these fields for website analytics to
              work. Use them only if they help your team keep context.
            </p>
            <LeadActionPanel
              currentStatus={lead.status}
              currentLossReason={lead.lossReason}
              estimatedValueMinor={lead.estimatedValueMinor}
              wonValueMinor={lead.wonValueMinor}
              statusAction={statusAction}
              valueAction={valueAction}
              noteAction={noteAction}
            />

            <section className={styles.notesSection}>
              <div className={styles.cardHeading}>
                <div>
                  <p>Private workspace</p>
                  <h2>Team notes</h2>
                </div>
                <InfoTip label="Explain team notes">
                  Notes added by your team are not shown to the customer.
                </InfoTip>
              </div>
              {lead.notes.length > 0 ? (
                <ol>
                  {lead.notes.map((note) => (
                    <li key={note.id}>
                      <p>{note.body}</p>
                      <span>{dateTime(note.createdAt)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.inlineEmpty}>No private notes yet.</p>
              )}
            </section>
          </details>
        </div>

        <aside className={styles.detailAside}>
          <section>
            <div className={styles.sideHeading}>
              <div>
                <p>History</p>
                <h2>Request activity</h2>
              </div>
              <InfoTip label="Explain request activity">
                This history shows when the request arrived and records any
                optional internal changes made by your team.
              </InfoTip>
            </div>
            <ol className={styles.timeline}>
              {lead.events.map((event) => (
                <li key={event.id}>
                  <span />
                  <div>
                    <strong>{eventLabel(event.eventType)}</strong>
                    <small>{dateTime(event.createdAt)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <div className={styles.sideHeading}>
              <div>
                <p>Notifications</p>
                <h2>Email records</h2>
              </div>
              <InfoTip label="Explain email records">
                This shows system notification records. A development capture
                does not mean a real email was delivered.
              </InfoTip>
            </div>
            {lead.deliveries.length > 0 ? (
              <ul className={styles.deliveryList}>
                {lead.deliveries.map((delivery) => (
                  <li key={delivery.id}>
                    <span>{deliveryStatusLabel(delivery.status)}</span>
                    <strong>
                      {delivery.templateKey === 'lead_confirmation'
                        ? 'Customer confirmation'
                        : 'Business notification'}
                    </strong>
                    <small>
                      {delivery.recipientDisplay} ·{' '}
                      {providerLabel(delivery.provider)}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.inlineEmpty}>
                No delivery record is visible for this request.
              </p>
            )}
          </section>

          <details className={styles.consentDetails}>
            <summary>Contact permission & source</summary>
            <dl>
              <div>
                <dt>Consent recorded</dt>
                <dd>{dateTime(lead.consentedAt)}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{lead.consentVersion}</dd>
              </div>
              <div>
                <dt>Campaign</dt>
                <dd>{lead.utmCampaign ?? 'Not supplied'}</dd>
              </div>
            </dl>
            <p>{lead.consentText}</p>
          </details>
        </aside>
      </div>
    </div>
  )
}
