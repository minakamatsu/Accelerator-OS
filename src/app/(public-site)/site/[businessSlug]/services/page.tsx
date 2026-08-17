import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { TrackedPhoneLink } from '@/components/public-site/tracked-phone-link'
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
        title: 'Automotive Services',
        description: `Explore the verified automotive service categories available from ${stripDemoLabel(site.name)} and call to confirm the right next step.`,
        path: '/services',
      })
    : { robots: { index: false, follow: false } }
}

export default async function ServicesPage({ params }: Props) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) notFound()

  const basePath = publicSiteBasePath(site, (await headers()).get('host'))
  const displayPhone = formatPhoneDisplay(site.profile.publicPhone)
  const callHref = phoneHref(site.profile.publicPhone)
  const eventPath = `/api/public/sites/${site.slug}/phone-click`

  return (
    <>
      <section className={styles.pageHero}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={publicSiteHref(basePath)}>Home</Link>
          <span aria-hidden="true">/</span>
          <span>Services</span>
        </nav>
        <div className={styles.pageHeroGrid}>
          <div>
            <p className={styles.eyebrow}>Verified service directory</p>
            <h1>Explore the work your vehicle may need.</h1>
            <p>
              These are the service categories currently confirmed for this
              business. Open any page for more context, then call to confirm
              fit, availability, and timing.
            </p>
          </div>
          <div className={styles.pageHeroImage}>
            <Image
              src="/images/atlas-auto/engine-detail.jpg"
              alt="Automotive engine compartment being inspected"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 40px), 38vw"
            />
          </div>
        </div>
      </section>

      <section
        className={styles.directorySection}
        aria-labelledby="directory-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Browse by category</p>
          <h2 id="directory-title">Start with the closest match.</h2>
          <p>
            You do not need to diagnose the vehicle yourself. These pages make
            it easier to describe why you are reaching out.
          </p>
        </div>
        {site.services.length > 0 ? (
          <div className={styles.directoryGrid}>
            {site.services.map((service, index) => (
              <Link
                className={styles.directoryCard}
                href={publicSiteHref(basePath, `/services/${service.slug}`)}
                key={service.slug}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{service.name}</h2>
                <p>
                  {stripDemoLabel(
                    service.shortDescription ??
                      'Call the shop to confirm the right next step.',
                  )}
                </p>
                <strong>Read the service guide →</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyServiceState}>
            <p className={styles.eyebrow}>Service list being confirmed</p>
            <h2>No unverified service pages have been published.</h2>
            <p>
              Call the shop or use the vehicle-concerns guide to describe what
              changed. The shop can confirm whether it is the right place to
              start.
            </p>
            <Link
              className={styles.sectionLink}
              href={publicSiteHref(basePath, '/vehicle-concerns')}
            >
              Open the vehicle-concerns guide <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>

      <section className={styles.unsurePanel}>
        <div>
          <p className={styles.eyebrow}>Do not see an exact match?</p>
          <h2>Describe what changed. The shop can confirm what comes next.</h2>
        </div>
        <TrackedPhoneLink
          href={callHref}
          eventPath={eventPath}
          className={styles.primaryButton}
          ariaLabel={`Call ${site.name} at ${site.profile.publicPhone}`}
        >
          <span>Call to confirm</span>
          <strong>{displayPhone}</strong>
        </TrackedPhoneLink>
      </section>
    </>
  )
}
