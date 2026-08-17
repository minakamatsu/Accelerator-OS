import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPublicSiteBySlug } from '@/data/public-site'
import {
  formatTime,
  isDemoSite,
  publicSiteBasePath,
  publicSiteHref,
  siteMetadata,
  stripDemoLabel,
} from '@/lib/public-site/presentation'
import styles from './public-site.module.css'

type Props = {
  params: Promise<{ businessSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)

  return site
    ? siteMetadata(site, {
        description: stripDemoLabel(site.profile.valueProposition),
      })
    : {
        title: { absolute: 'Site unavailable' },
        robots: { index: false, follow: false },
      }
}

export default async function BusinessSiteHome({ params }: Props) {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) notFound()

  const requestHeaders = await headers()
  const basePath = publicSiteBasePath(site, requestHeaders.get('host'))
  const valueProposition = stripDemoLabel(site.profile.valueProposition)
  const isDemo = isDemoSite(site)
  const servicesHref = publicSiteHref(basePath, '/services')
  const concernsHref = publicSiteHref(basePath, '/vehicle-concerns')
  const visitHref = publicSiteHref(basePath, '/visit')
  const quoteHref = publicSiteHref(basePath, '/quote')

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            Clear answers start with a clear conversation
          </p>
          <h1 id="hero-title">Practical care for the road ahead.</h1>
          <p className={styles.heroLead}>{valueProposition}</p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href={quoteHref}>
              <span>{site.profile.primaryCta}</span>
              <strong>Share vehicle details</strong>
            </Link>
            <Link className={styles.secondaryButton} href={concernsHref}>
              Help me describe the issue
            </Link>
          </div>

          <dl className={styles.quickFacts}>
            <div>
              <dt>Weekday hours</dt>
              <dd>
                {formatTime(site.profile.hours.monday?.open ?? '08:00')}–
                {formatTime(site.profile.hours.monday?.close ?? '17:00')}
              </dd>
            </div>
            <div>
              <dt>Service area</dt>
              <dd>
                {stripDemoLabel(site.profile.serviceArea ?? site.profile.city)}
              </dd>
            </div>
            <div>
              <dt>Best first step</dt>
              <dd>Call and describe what changed</dd>
            </div>
          </dl>
        </div>

        <div className={styles.heroVisual}>
          <Image
            className={styles.heroImage}
            src="/images/atlas-auto/service-bay.jpg"
            alt="Mechanic working beneath a raised vehicle in an automotive service bay"
            fill
            priority
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), 42vw"
          />
          <div className={styles.visualScrim} aria-hidden="true" />
          <div className={styles.visualLabel}>
            <span>Licensed automotive preview</span>
            <strong>Inside the service bay</strong>
          </div>
          <div className={styles.visualCallout}>
            <span>Start the conversation</span>
            <strong>Tell us what changed.</strong>
            <small>Plain language is enough.</small>
          </div>
          <div className={styles.visualFooter} aria-hidden="true">
            <span>Maintenance</span>
            <span>Safety</span>
            <span>Diagnostics</span>
          </div>
        </div>
      </section>

      <section
        className={styles.proofStrip}
        aria-label="Verified business essentials"
      >
        <p>Approved essentials, kept simple</p>
        <ul>
          <li>Published phone</li>
          <li>Confirmed weekday hours</li>
          <li>Verified service address</li>
          <li>No invented ratings or guarantees</li>
        </ul>
      </section>

      <section
        className={styles.imageStory}
        aria-labelledby="image-story-title"
      >
        <div className={styles.imageStoryIntro}>
          <p className={styles.eyebrow}>In the bay</p>
          <h2 id="image-story-title">
            Built around the vehicle, not the vocabulary.
          </h2>
          <p>
            You can start with the sound, warning light, feeling, or maintenance
            need. The details help shape the next conversation.
          </p>
        </div>

        <div className={styles.imageMosaic}>
          <figure className={styles.imageFigureWide}>
            <div className={styles.imageFrame}>
              <Image
                src="/images/atlas-auto/engine-detail.jpg"
                alt="Hands inspecting components beneath a vehicle hood"
                fill
                sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 58vw, 48vw"
              />
            </div>
            <figcaption>
              <span>01 / Under the hood</span>
              <strong>Start with what you notice.</strong>
            </figcaption>
          </figure>

          <figure className={styles.imageFigureTall}>
            <div className={styles.imageFrame}>
              <Image
                src="/images/atlas-auto/under-hood.jpg"
                alt="Mechanic using a hand tool in a vehicle engine bay"
                fill
                sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 36vw, 30vw"
              />
            </div>
            <figcaption>
              <span>02 / Hands-on detail</span>
              <strong>Then confirm the right next step.</strong>
            </figcaption>
          </figure>
        </div>

        {isDemo ? (
          <p className={styles.stockDisclosure}>
            Licensed stock photography illustrates the automotive direction; it
            does not depict this fictional demo business.
          </p>
        ) : null}
      </section>

      <section
        className={styles.servicesSection}
        aria-labelledby="services-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Explore verified service categories</p>
          <h2 id="services-title">A clearer path to the right page.</h2>
          <p>
            Each listed category has its own page with a plain-language summary,
            useful call preparation, and links to related topics.
          </p>
        </div>

        {site.services.length > 0 ? (
          <>
            <div className={styles.serviceGrid}>
              {site.services.map((service, index) => (
                <article className={styles.serviceCard} key={service.slug}>
                  <div className={styles.serviceNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3>{service.name}</h3>
                    <p>
                      {stripDemoLabel(
                        service.shortDescription ??
                          'Call the shop to confirm the right next step.',
                      )}
                    </p>
                  </div>
                  <Link
                    href={publicSiteHref(basePath, `/services/${service.slug}`)}
                  >
                    Explore this service <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>

            <Link className={styles.sectionLink} href={servicesHref}>
              View the complete service guide <span aria-hidden="true">→</span>
            </Link>
          </>
        ) : (
          <div className={styles.emptyServiceState}>
            <p className={styles.eyebrow}>Service list being confirmed</p>
            <h3>Start with what you notice about the vehicle.</h3>
            <p>
              No service categories have been published for this shop yet. Use
              the vehicle-concerns guide or call directly to confirm whether the
              shop can help.
            </p>
            <Link className={styles.sectionLink} href={concernsHref}>
              Open the vehicle-concerns guide <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>

      <section className={styles.pathSection} aria-label="More ways to start">
        <Link className={styles.pathCard} href={concernsHref}>
          <span>Not sure what it is?</span>
          <strong>Start with what the vehicle is doing.</strong>
          <small>Open the vehicle-concerns guide →</small>
        </Link>
        <Link className={styles.pathCardAccent} href={visitHref}>
          <span>Ready to plan the visit?</span>
          <strong>Find the hours, address, and direct line.</strong>
          <small>Open hours & location →</small>
        </Link>
      </section>
    </>
  )
}
