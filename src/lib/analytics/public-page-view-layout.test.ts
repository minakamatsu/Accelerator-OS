import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('public page-view capture', () => {
  it('records public navigation but excludes authenticated portal preview mode', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(public-site)/site/[businessSlug]/layout.tsx',
      ),
      'utf8',
    )

    expect(source).toContain('!isPortalPreview ?')
    expect(source).toContain('<PublicPageView')
    expect(source).toContain('/page-view')
    expect(source).toContain('businessSlug={site.slug}')

    const tracker = readFileSync(
      resolve(process.cwd(), 'src/components/public-site/public-page-view.tsx'),
      'utf8',
    )
    expect(tracker).toContain('getAnalyticsVisitorId')
    expect(tracker).toContain('getAnalyticsAttribution')
    expect(tracker).toContain('viewportWidth')
  })

  it('tracks only the approved high-intent links', () => {
    const actionTracker = readFileSync(
      resolve(
        process.cwd(),
        'src/components/public-site/tracked-action-link.tsx',
      ),
      'utf8',
    )
    const visitPage = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(public-site)/site/[businessSlug]/visit/page.tsx',
      ),
      'utf8',
    )

    expect(actionTracker).toContain("'directions' | 'contact'")
    expect(visitPage).toContain('action="directions"')
  })
})
