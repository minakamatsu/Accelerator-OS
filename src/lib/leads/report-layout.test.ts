import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('website lead report layout', () => {
  it('keeps the page read-only and free from CRM pipeline language', () => {
    const page = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/page.tsx',
      ),
      'utf8',
    )

    expect(page).toContain('Quote requests in one clear list.')
    expect(page).toContain('Search leads')
    expect(page).toContain('Leads over time')
    expect(page).toContain('<table>')
    expect(page).not.toContain('Pipeline stage')
    expect(page).not.toContain('Estimate sent')
    expect(page).not.toContain('Won')
    expect(page).not.toContain('Update status')
  })

  it('uses mobile-first cards before expanding into a desktop table', () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/report.module.css',
      ),
      'utf8',
    )

    expect(styles).toContain('.tableScroll thead {')
    expect(styles).toContain('display: none;')
    expect(styles).toContain('@media (min-width: 60rem)')
    expect(styles).toContain('@media (min-width: 48rem)')
    expect(styles).toContain('table-layout: fixed')
    expect(styles).not.toContain('@media (max-width:')
    expect(styles).toContain('overflow-x: auto')
  })

  it('fits the complete trend inside the chart without horizontal scrolling', () => {
    const chart = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/lead-trend-chart.tsx',
      ),
      'utf8',
    )
    const styles = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/report.module.css',
      ),
      'utf8',
    )
    const chartBlock = styles.match(/\.chart\s*\{([\s\S]*?)\n\}/)?.[1]

    expect(chart).toContain('smoothTrendPath(points)')
    expect(chart).toContain('preserveAspectRatio="none"')
    expect(chart).toContain('chartTickIndexes')
    expect(chart).toContain('{point.axisLabel}')
    expect(chart).toContain("'--axis-columns': trend.length")
    expect(styles).toContain('.chartAxis {')
    expect(chartBlock).toContain('overflow: hidden')
    expect(chartBlock).not.toContain('overflow-x: auto')
    expect(styles).not.toContain('grid-auto-flow: column')
  })

  it('supports pointer and keyboard inspection plus line and bar views', () => {
    const chart = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/lead-trend-chart.tsx',
      ),
      'utf8',
    )

    expect(chart).toContain("type ChartMode = 'line' | 'bar'")
    expect(chart).toContain('aria-label="Choose chart view"')
    expect(chart).toContain("aria-pressed={mode === 'line'}")
    expect(chart).toContain("aria-pressed={mode === 'bar'}")
    expect(chart).toContain('onPointerEnter={() => setActiveIndex(index)}')
    expect(chart).toContain('onFocus={() => setActiveIndex(index)}')
    expect(chart).toContain('quote request')
    expect(chart).not.toContain('calls done')
  })

  it('scopes every lead query to the authorized business', () => {
    const dataSource = readFileSync(
      resolve(process.cwd(), 'src/data/leads.ts'),
      'utf8',
    )
    const reportQuery = dataSource.slice(
      dataSource.indexOf('export async function getWebsiteLeadReport'),
      dataSource.indexOf('export type LeadDetail'),
    )

    expect(reportQuery).toContain(".from('leads')")
    expect(reportQuery).toContain(".eq('business_id', businessId)")
    expect(reportQuery).toContain('await requireAuthenticatedUser()')
  })
})
