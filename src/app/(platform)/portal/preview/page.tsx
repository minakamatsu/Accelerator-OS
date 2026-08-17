import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { BusinessRoster } from '@/components/business-roster'
import { EmptyState } from '@/components/empty-state'
import { listAccessibleBusinesses } from '@/data/businesses'

export default async function WebsitePreviewChooser() {
  const businesses = await listAccessibleBusinesses()

  if (businesses.length === 1) {
    redirect(`/portal/businesses/${businesses[0].id}/website-preview` as Route)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-[var(--line)] pb-8">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
          Website preview
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
          Choose a business website.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
          Preview the customer experience with controls for returning to the
          workspace or opening the public website.
        </p>
      </header>

      <div className="mt-8">
        {businesses.length > 0 ? (
          <BusinessRoster
            businesses={businesses}
            eyebrow="Accessible websites"
            showPreview
          />
        ) : (
          <EmptyState
            eyebrow="Website preview"
            title="No website access is assigned."
            description="A platform administrator must assign a business membership before its preview is available."
          />
        )}
      </div>
    </div>
  )
}
