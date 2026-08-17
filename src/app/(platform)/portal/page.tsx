import type { Metadata, Route } from 'next'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/empty-state'
import { listAccessibleBusinesses } from '@/data/businesses'
import { requireAuthenticatedUser } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: 'Client portal',
}

export default async function PortalPage() {
  const access = await requireAuthenticatedUser()

  if (access.mode === 'development' || access.platformRole === 'admin') {
    redirect('/admin')
  }

  const businesses = await listAccessibleBusinesses()
  if (businesses.length === 1) {
    redirect(`/portal/businesses/${businesses[0].id}` as Route)
  }

  return (
    <div className="mx-auto max-w-3xl">
      {businesses.length === 0 ? (
        <EmptyState
          eyebrow="Account setup"
          title="No business is connected to this account yet."
          description="Ask your agency contact to finish assigning this login to your business. No client data will appear until that access is configured."
        />
      ) : (
        <EmptyState
          eyebrow="Account configuration"
          title="This login is connected to more than one business."
          description="The client portal uses one login per business so analytics cannot be mixed accidentally. Ask your agency contact to provide a separate email login for each business."
        />
      )}
    </div>
  )
}
