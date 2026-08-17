import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('client dashboard responsive layout', () => {
  it('uses a mobile-first base and only expands at minimum-width breakpoints', () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/dashboard.module.css',
      ),
      'utf8',
    )

    expect(styles).toContain('.metrics {')
    expect(styles).toContain('@media (min-width: 36rem)')
    expect(styles).toContain('@media (min-width: 64rem)')
    expect(styles).not.toContain('@media (max-width:')
    expect(styles).toContain('overflow-x: auto')
  })

  it('keeps business analytics visible without linking to a request workspace or developer health data', () => {
    const page = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/page.tsx',
      ),
      'utf8',
    )

    expect(page).toContain('label="Unique visitors"')
    expect(page).toContain('label="Estimate requests"')
    expect(page).toContain('label="Visitor action rate"')
    expect(page).toContain('analyticsRangeLabel(range)')
    expect(page).toContain('title="Top pages"')
    expect(page).toContain('title="Traffic sources"')
    expect(page).toContain('title="How visitors viewed the site"')
    expect(page).not.toContain('/leads')
    expect(page).not.toContain('View website requests')
    expect(page).not.toContain('Core Web Vitals')
    expect(page).not.toContain('Website health')
  })

  it('keeps range controls readable in both client and agency themes', () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/dashboard.module.css',
      ),
      'utf8',
    )

    expect(styles).toContain('background: var(--control)')
    expect(styles).toContain('background: var(--nav-active)')
    expect(styles).toContain('color: var(--nav-active-text)')
  })
})
