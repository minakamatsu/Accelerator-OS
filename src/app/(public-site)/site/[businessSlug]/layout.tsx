import type { CSSProperties, ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { TrackedPhoneLink } from '@/components/public-site/tracked-phone-link'
import { TrackedActionLink } from '@/components/public-site/tracked-action-link'
import { PublicPageView } from '@/components/public-site/public-page-view'
import { getPublicSiteBySlug } from '@/data/public-site'
import { formatPhoneDisplay, phoneHref } from '@/lib/public-site/phone'
import { publicPreviewCookie } from '@/lib/public-site/preview'
import {
  formatAddress,
  formatCategory,
  isDemoSite,
  publicSiteBasePath,
  publicSiteHref,
  safeColor,
  siteJsonLd,
  siteMetadata,
  stripDemoLabel,
} from '@/lib/public-site/presentation'
import styles from './public-site.module.css'

type Props = {
  children: ReactNode
  params: Promise<{ businessSlug: string }>
}

type SiteStyle = CSSProperties & {
  '--site-primary': string
  '--site-accent': string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)
  if (!site) {
    return {
      title: { absolute: 'Site unavailable' },
      robots: { index: false, follow: false },
    }
  }

  return {
    ...siteMetadata(site, {
      description: stripDemoLabel(site.profile.valueProposition),
    }),
    title: {
      default: site.name,
      template: `%s | ${stripDemoLabel(site.name)}`,
    },
  }
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { businessSlug } = await params
  const site = await getPublicSiteBySlug(businessSlug)

  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: safeColor(site?.brand.colorDirection.primary, '#123b35'),
  }
}

export default async function PublicBusinessLayout({
  children,
  params,
}: Props) {
  const { businessSlug } = await params
  const [site, requestHeaders, cookieStore] = await Promise.all([
    getPublicSiteBySlug(businessSlug),
    headers(),
    cookies(),
  ])
  if (!site) notFound()

  const basePath = publicSiteBasePath(site, requestHeaders.get('host'))
  const href = phoneHref(site.profile.publicPhone)
  const displayPhone = formatPhoneDisplay(site.profile.publicPhone)
  const eventPath = `/api/public/sites/${site.slug}/phone-click`
  const actionEventPath = `/api/public/sites/${site.slug}/action-click`
  const address = formatAddress(site.profile)
  const isDemo = isDemoSite(site)
  const isPortalPreview =
    cookieStore.get(publicPreviewCookie)?.value === site.slug
  const siteStyle: SiteStyle = {
    '--site-primary': safeColor(site.brand.colorDirection.primary, '#123b35'),
    '--site-accent': safeColor(site.brand.colorDirection.accent, '#d8f23f'),
  }
  const routes = {
    home: publicSiteHref(basePath),
    services: publicSiteHref(basePath, '/services'),
    concerns: publicSiteHref(basePath, '/vehicle-concerns'),
    visit: publicSiteHref(basePath, '/visit'),
    quote: publicSiteHref(basePath, '/quote'),
  }

  return (
    <div className={styles.site} style={siteStyle}>
      {!isPortalPreview ? (
        <PublicPageView
          endpoint={`/api/public/sites/${site.slug}/page-view`}
          businessSlug={site.slug}
        />
      ) : null}
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      {isPortalPreview ? (
        <aside
          className={styles.previewToolbar}
          aria-label="Website preview controls"
        >
          <div>
            <strong>Website preview</strong>
            <span>You are viewing the customer-facing website.</span>
          </div>
          <nav aria-label="Leave website preview">
            <a
              href={`/portal/preview/exit?slug=${encodeURIComponent(site.slug)}&destination=portal`}
            >
              ← Back to client portal
            </a>
            <a
              className={styles.openPublicSite}
              href={`/portal/preview/exit?slug=${encodeURIComponent(site.slug)}&destination=website`}
            >
              Open public site ↗
            </a>
          </nav>
        </aside>
      ) : null}

      {isDemo ? (
        <div className={styles.demoBanner} role="note">
          Fictional development preview · No real shop, offer, or customer claim
          is represented
        </div>
      ) : null}

      <header className={styles.header}>
        <a
          className={styles.wordmark}
          href={routes.home}
          aria-label={`${site.name} home`}
        >
          <span className={styles.mark} aria-hidden="true">
            A
          </span>
          <span>
            {site.name}
            <small>{formatCategory(site.category)}</small>
          </span>
        </a>

        <nav className={styles.navigation} aria-label="Main navigation">
          <a href={routes.home}>Home</a>
          <a href={routes.services}>Services</a>
          <a href={routes.concerns}>Vehicle concerns</a>
          <a href={routes.visit}>Visit</a>
          <a href={routes.quote}>Request</a>
        </nav>

        <TrackedPhoneLink
          href={href}
          eventPath={eventPath}
          className={styles.navCall}
          ariaLabel={`Call ${site.name} at ${site.profile.publicPhone}`}
        >
          <span>Call</span> {displayPhone}
        </TrackedPhoneLink>
      </header>

      <main id="main-content">{children}</main>

      <footer className={styles.footer}>
        <a className={styles.wordmark} href={routes.home}>
          <span className={styles.mark} aria-hidden="true">
            A
          </span>
          <span>{site.name}</span>
        </a>
        <nav className={styles.footerNav} aria-label="Footer navigation">
          <a href={routes.services}>Services</a>
          <a href={routes.concerns}>Vehicle concerns</a>
          <a href={routes.visit}>Hours & location</a>
          <a href={routes.quote}>Request service</a>
        </nav>
        <div>
          <p>{address}</p>
          <p className={styles.phoneNumber}>{displayPhone}</p>
          {site.profile.publicEmail ? (
            <p>
              <TrackedActionLink
                href={`mailto:${site.profile.publicEmail}`}
                eventPath={actionEventPath}
                action="contact"
              >
                {site.profile.publicEmail}
              </TrackedActionLink>
            </p>
          ) : null}
        </div>
        <p>
          {isDemo
            ? 'Fictional preview content for development and review only.'
            : 'Call the shop to confirm availability and service details.'}
        </p>
      </footer>

      <div className={styles.mobileCallBar}>
        <TrackedPhoneLink
          href={href}
          eventPath={eventPath}
          ariaLabel={`Call ${site.name} at ${site.profile.publicPhone}`}
        >
          <span>Call now</span>
          <strong>{displayPhone}</strong>
        </TrackedPhoneLink>
      </div>

      {!isDemo ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd(site)).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
    </div>
  )
}
