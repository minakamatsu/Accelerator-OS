import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { TrackedPhoneLink } from '@/components/public-site/tracked-phone-link'
import { TrackedActionLink } from '@/components/public-site/tracked-action-link'
import { getPublicSiteBySlug } from '@/data/public-site'
import { formatPhoneDisplay, phoneHref } from '@/lib/public-site/phone'
import {
  dayLabels,
  formatAddress,
  formatTime,
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
        title: 'Hours, Location & Contact',
        description: `Find the verified hours, address, directions, and direct phone number for ${stripDemoLabel(site.name)}.`,
        path: '/visit',
      })
    : { robots: { index: false, follow: false } }
}

export default async function VisitPage({ params }: Props) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) notFound()

  const basePath = publicSiteBasePath(site, (await headers()).get('host'))
  const address = formatAddress(site.profile)
  const callHref = phoneHref(site.profile.publicPhone)
  const displayPhone = formatPhoneDisplay(site.profile.publicPhone)
  const eventPath = `/api/public/sites/${site.slug}/phone-click`
  const actionEventPath = `/api/public/sites/${site.slug}/action-click`

  return (
    <>
      <section className={styles.pageHero}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={publicSiteHref(basePath)}>Home</Link>
          <span aria-hidden="true">/</span>
          <span>Hours & location</span>
        </nav>
        <div className={styles.pageHeroGrid}>
          <div>
            <p className={styles.eyebrow}>Plan the visit</p>
            <h1>Hours, location, and a direct line.</h1>
            <p>
              Call before making the trip so the shop can confirm timing and the
              appropriate next step for your vehicle.
            </p>
            <TrackedPhoneLink
              href={callHref}
              eventPath={eventPath}
              className={styles.primaryButton}
              ariaLabel={`Call ${site.name} at ${site.profile.publicPhone}`}
            >
              <span>Call the shop</span>
              <strong>{displayPhone}</strong>
            </TrackedPhoneLink>
          </div>
          <div className={styles.pageHeroImage}>
            <Image
              src="/images/atlas-auto/service-bay.jpg"
              alt="Automotive service bay with a raised vehicle"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 40px), 38vw"
            />
          </div>
        </div>
      </section>

      <section className={styles.locationSection}>
        <div className={styles.locationIntro}>
          <p className={styles.eyebrow}>Verified details</p>
          <h2>Everything needed before heading over.</h2>
          <p>
            The address and hours below come from the approved business profile.
            Availability for a particular service still requires a quick
            conversation.
          </p>
        </div>

        <div className={styles.hoursCard}>
          <div className={styles.addressBlock}>
            <span>Address</span>
            <address>{address}</address>
            {site.profile.mapUrl ? (
              <TrackedActionLink
                href={site.profile.mapUrl}
                eventPath={actionEventPath}
                action="directions"
                target="_blank"
                rel="noreferrer"
              >
                Open directions <span aria-hidden="true">↗</span>
              </TrackedActionLink>
            ) : (
              <p>Directions link not yet supplied.</p>
            )}
          </div>

          <div className={styles.hoursBlock}>
            <span>Hours</span>
            <dl>
              {Object.entries(dayLabels).map(([day, label]) => {
                const hours = site.profile.hours[day]
                return (
                  <div key={day}>
                    <dt>{label}</dt>
                    <dd>
                      {hours
                        ? `${formatTime(hours.open)}–${formatTime(hours.close)}`
                        : 'Closed'}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      <div className={styles.centeredLinkRow}>
        <Link
          className={styles.sectionLink}
          href={publicSiteHref(basePath, '/services')}
        >
          Review services before calling <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}
