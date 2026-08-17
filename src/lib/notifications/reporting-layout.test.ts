import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('notification reporting navigation', () => {
  it('keeps the overview as a searchable business directory without a delivery log', () => {
    const overview = source('src/app/(platform)/admin/notifications/page.tsx')
    const directory = source(
      'src/components/notifications/notification-business-directory.tsx',
    )

    expect(overview).toContain('NotificationBusinessDirectory')
    expect(overview).not.toContain('NotificationLogFilters')
    expect(directory).toContain('Search businesses')
    expect(directory).toContain('/admin/notifications/${business.id}')
  })

  it('places business analytics and both date-browsing methods on a dedicated route', () => {
    const businessPage = source(
      'src/app/(platform)/admin/notifications/[businessId]/page.tsx',
    )
    const dateNavigator = source(
      'src/components/notifications/notification-date-navigator.tsx',
    )
    const logFilters = source(
      'src/components/notifications/notification-report-controls.tsx',
    )

    expect(businessPage).toContain('NotificationDateNavigator')
    expect(businessPage).toContain('NotificationLogFilters')
    expect(logFilters).toContain('Exact submitted date')
    expect(dateNavigator).toContain('overflow-x-auto')
    expect(dateNavigator).toContain('Scroll to newer dates')
    expect(dateNavigator).toContain('Scroll to older dates')
  })

  it('uses distinct semantic tones for email states and keeps their labels', () => {
    const analytics = source(
      'src/components/notifications/notification-analytics-summary.tsx',
    )
    const businessPage = source(
      'src/app/(platform)/admin/notifications/[businessId]/page.tsx',
    )

    expect(analytics).toContain('bg-emerald-400/8')
    expect(analytics).toContain('bg-amber-400/8')
    expect(analytics).toContain('bg-rose-400/8')
    expect(businessPage).toContain("label: 'Retry scheduled'")
    expect(businessPage).toContain("label: 'Needs attention'")
  })
})
