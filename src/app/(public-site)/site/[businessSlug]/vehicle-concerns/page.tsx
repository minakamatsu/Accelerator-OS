import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ServiceTriage } from '@/components/public-site/service-triage'
import { getPublicSiteBySlug } from '@/data/public-site'
import { formatPhoneDisplay, phoneHref } from '@/lib/public-site/phone'
import {
  publicSiteBasePath,
  publicSiteHref,
  siteMetadata,
  stripDemoLabel,
} from '@/lib/public-site/presentation'
import styles from '../public-site.module.css'

type Props = { params: Promise<{ businessSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  return site
    ? siteMetadata(site, {
        title: 'Vehicle Concerns Guide',
        description: `Use a plain-language vehicle-concerns guide to find a useful conversation starting point with ${stripDemoLabel(site.name)}.`,
        path: '/vehicle-concerns',
      })
    : { robots: { index: false, follow: false } }
}

export default async function VehicleConcernsPage({ params }: Props) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) notFound()

  const basePath = publicSiteBasePath(site, (await headers()).get('host'))
  const callHref = phoneHref(site.profile.publicPhone)
  const displayPhone = formatPhoneDisplay(site.profile.publicPhone)
  const eventPath = `/api/public/sites/${site.slug}/phone-click`

  return (
    <>
      <section className={styles.compactPageHero}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={publicSiteHref(basePath)}>Home</Link>
          <span aria-hidden="true">/</span>
          <span>Vehicle concerns</span>
        </nav>
        <p className={styles.eyebrow}>Plain-language starting point</p>
        <h1>You do not need the perfect automotive term.</h1>
        <p>
          Start with what changed. This guide does not diagnose the vehicle—it
          helps you reach the most relevant verified service conversation.
        </p>
      </section>

      <section className={styles.triagePageSection}>
        <ServiceTriage
          services={site.services}
          phoneHref={callHref}
          phoneLabel={displayPhone}
          eventPath={eventPath}
        />
      </section>

      <section
        className={styles.processSection}
        aria-labelledby="process-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>A better first conversation</p>
          <h2 id="process-title">Notice. Describe. Confirm.</h2>
          <p>
            These steps apply even when the exact service is not obvious from
            the information currently available.
          </p>
        </div>
        <ol className={styles.processList}>
          <li>
            <span>01</span>
            <h3>Notice</h3>
            <p>Think about what changed and when you first noticed it.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Describe</h3>
            <p>Share the sound, light, feeling, or maintenance need.</p>
          </li>
          <li>
            <span>03</span>
            <h3>Confirm</h3>
            <p>The shop can clarify the most appropriate next step with you.</p>
          </li>
        </ol>
      </section>

      <div className={styles.centeredLinkRow}>
        <Link
          className={styles.sectionLink}
          href={publicSiteHref(basePath, '/services')}
        >
          Browse all verified services <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}
