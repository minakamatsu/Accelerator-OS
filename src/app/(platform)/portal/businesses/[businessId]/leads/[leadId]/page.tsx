import type { Route } from 'next'
import { redirect } from 'next/navigation'

export default async function RetiredLeadDetailPage({
  params,
}: PageProps<'/portal/businesses/[businessId]/leads/[leadId]'>) {
  const { businessId } = await params
  redirect(`/portal/businesses/${businessId}/leads` as Route)
}
