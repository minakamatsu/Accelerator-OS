import type { Route } from 'next'
import { redirect } from 'next/navigation'

export default async function RetiredRequestWorkspaceLayout({
  params,
}: LayoutProps<'/portal/businesses/[businessId]/leads'>) {
  const { businessId } = await params
  redirect(`/portal/businesses/${businessId}` as Route)
}
