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
import styles from '../../public-site.module.css'

type Props = {
  params: Promise<{ businessSlug: string; serviceSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug, serviceSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  const service = site?.services.find((item) => item.slug === serviceSlug)
  if (!site || !service) {
    return {
      title: 'Service page unavailable',
      robots: { index: false, follow: false },
    }
  }

  return siteMetadata(site, {
    title: service.name,
    description: stripDemoLabel(
      service.shortDescription ??
        `Learn how to start a conversation about ${service.name} and call the shop to confirm the appropriate next step.`,
    ),
    path: `/services/${service.slug}`,
  })
}

export default async function ServiceDetailPage({ params }: Props) {
  const { businessSlug, serviceSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  const service = site?.services.find((item) => item.slug === serviceSlug)
  if (!site || !service) notFound()

  const basePath = publicSiteBasePath(site, (await headers()).get('host'))
  const displayPhone = formatPhoneDisplay(site.profile.publicPhone)
  const callHref = phoneHref(site.profile.publicPhone)
  const eventPath = `/api/public/sites/${site.slug}/phone-click`
  const relatedServices = site.services
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3)

  return (
    <>
      <article className={styles.serviceDetail}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={publicSiteHref(basePath)}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={publicSiteHref(basePath, '/services')}>Services</Link>
          <span aria-hidden="true">/</span>
          <span>{service.name}</span>
        </nav>

        <div className={styles.detailHero}>
          <div className={styles.detailHeroCopy}>
            <p className={styles.eyebrow}>Service guide</p>
            <h1>{service.name}</h1>
            <p>
              {stripDemoLabel(
                service.shortDescription ??
                  'Call the shop to confirm the right next step for your vehicle.',
              )}
            </p>
            <TrackedPhoneLink
              href={callHref}
              eventPath={eventPath}
              className={styles.primaryButton}
              ariaLabel={`Call about ${service.name}`}
            >
              <span>Ask about this service</span>
              <strong>{displayPhone}</strong>
            </TrackedPhoneLink>
          </div>
          <div className={styles.detailHeroImage}>
            <Image
              src="/images/atlas-auto/under-hood.jpg"
              alt="Mechanic working with a hand tool in an engine bay"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 40px), 40vw"
            />
          </div>
        </div>

        <div className={styles.detailBody}>
          <section aria-labelledby="share-title">
            <p className={styles.eyebrow}>Prepare for the call</p>
            <h2 id="share-title">
              A few details can make the first conversation clearer.
            </h2>
            <ol className={styles.detailSteps}>
              <li>
                <span>01</span>
                <div>
                  <h3>What changed?</h3>
                  <p>
                    Describe the sound, light, feeling, or maintenance need.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>When did it start?</h3>
                  <p>
                    Share when you first noticed it and how often it happens.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>What happens next?</h3>
                  <p>
                    The shop can confirm whether this category is the right fit.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <aside className={styles.confirmationCard}>
            <span>Good to know</span>
            <h2>Call before making the trip.</h2>
            <p>
              This page explains a verified service category, but it does not
              diagnose a vehicle or promise availability, pricing, or a repair
              outcome.
            </p>
            <Link href={publicSiteHref(basePath, '/visit')}>
              View hours & location →
            </Link>
          </aside>
        </div>
      </article>

      <section
        className={styles.relatedSection}
        aria-labelledby="related-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Keep exploring</p>
          <h2 id="related-title">Related verified categories.</h2>
          <p>
            Use the closest match, or call if you are unsure where to begin.
          </p>
        </div>
        <div className={styles.relatedGrid}>
          {relatedServices.map((item) => (
            <Link
              href={publicSiteHref(basePath, `/services/${item.slug}`)}
              key={item.slug}
            >
              <span>Service guide</span>
              <strong>{item.name}</strong>
              <small>Open page →</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
