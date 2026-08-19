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
    expect(page).toContain('<RefreshDataButton />')
    expect(page).not.toContain('/leads')
    expect(page).not.toContain('View website requests')
    expect(page).not.toContain('Core Web Vitals')
    expect(page).not.toContain('Website health')
  })

  it('refreshes shared agency and client analytics in place', () => {
    const control = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/refresh-data-button.tsx',
      ),
      'utf8',
    )

    expect(control).toContain('router.refresh()')
    expect(control).toContain('useTransition()')
    expect(control).toContain("'Refreshing…'")
    expect(control).not.toContain('window.location')
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

  it('keeps metric explanations on matching semantic surfaces in every theme', () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/dashboard.module.css',
      ),
      'utf8',
    )
    const explanation = styles.match(
      /\.metricLabel details p\s*\{([\s\S]*?)\n\}/,
    )?.[1]

    expect(explanation).toBeDefined()
    expect(explanation).toContain('background: var(--control)')
    expect(explanation).toContain('color: var(--ink)')
    expect(explanation).not.toContain('background: var(--ink)')
    expect(explanation).not.toMatch(/color:\s*(?:white|#fff(?:fff)?)/i)
  })
})
