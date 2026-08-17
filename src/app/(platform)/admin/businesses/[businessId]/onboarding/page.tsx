import type { Route } from 'next'
import { redirect } from 'next/navigation'

export default async function RetiredOnboardingPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = await params
  redirect(`/admin/businesses/${businessId}` as Route)
}
