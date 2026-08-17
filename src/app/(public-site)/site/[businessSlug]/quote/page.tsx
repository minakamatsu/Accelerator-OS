import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { QuoteForm } from '@/components/public-site/quote-form'
import { getPublicSiteBySlug } from '@/data/public-site'
import { leadConsentText } from '@/lib/leads/schemas'
import {
  publicSiteBasePath,
  publicSiteHref,
  siteMetadata,
  stripDemoLabel,
} from '@/lib/public-site/presentation'
import { serverEnv } from '@/lib/env/server'
import { submitPublicQuote } from './actions'
import styles from '../public-site.module.css'

type Props = {
  params: Promise<{ businessSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  return site
    ? siteMetadata(site, {
        title: 'Request Service',
        description: `Send ${stripDemoLabel(site.name)} a service request with your contact and vehicle details.`,
        path: '/quote',
      })
    : { robots: { index: false, follow: false } }
}

export default async function QuotePage({ params, searchParams }: Props) {
  const [{ businessSlug }, query] = await Promise.all([params, searchParams])
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) notFound()

  const basePath = publicSiteBasePath(site, (await headers()).get('host'))
  const action = submitPublicQuote.bind(null, businessSlug)
  const turnstileSiteKey =
    serverEnv.TURNSTILE_MODE === 'enabled'
      ? (serverEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null)
      : null

  return (
    <article className={styles.quotePage}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href={publicSiteHref(basePath)}>Home</Link>
        <span aria-hidden="true">/</span>
        <span>Request service</span>
      </nav>

      <div className={styles.quotePageGrid}>
        <div className={styles.quoteIntro}>
          <p className={styles.eyebrow}>Start the conversation</p>
          <h1>Share the details before the call.</h1>
          <p>
            This request gives the shop a clear starting point. It does not
            diagnose the vehicle, confirm availability, or create a price
            estimate.
          </p>
          <div className={styles.quoteImage}>
            <Image
              src="/images/atlas-auto/engine-detail.jpg"
              alt="Mechanic inspecting components under a vehicle hood"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 40px), 38vw"
            />
            <span>Tell us what changed.</span>
          </div>
          <ul className={styles.quoteAssurances}>
            <li>One request, shared with the shop for follow-up</li>
            <li>No payment information collected</li>
            <li>No marketing-message consent</li>
          </ul>
        </div>

        <QuoteForm
          action={action}
          services={site.services.map(({ slug, name }) => ({ slug, name }))}
          idempotencyKey={randomUUID()}
          consentText={leadConsentText(site.name)}
          turnstileSiteKey={turnstileSiteKey}
          attribution={{
            source: first(query.source) || 'website_quote',
            utmSource: first(query.utm_source),
            utmMedium: first(query.utm_medium),
            utmCampaign: first(query.utm_campaign),
          }}
        />
      </div>
    </article>
  )
}
