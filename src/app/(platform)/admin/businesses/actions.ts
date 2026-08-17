'use server'

import type { Route } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  AgencyBusinessError,
  createAgencyBusiness,
} from '@/data/agency-businesses'
import type { OnboardingActionState } from '@/lib/onboarding/action-state'
import { agencyBusinessSchema } from '@/lib/agency-business/schema'

export async function createBusinessAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validated = agencyBusinessSchema.safeParse({
    name: formData.get('name'),
    contactName: formData.get('contactName'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone'),
    websiteUrl: formData.get('websiteUrl'),
    addressLine1: formData.get('addressLine1'),
    city: formData.get('city'),
    region: formData.get('region'),
    postalCode: formData.get('postalCode'),
    timezone: formData.get('timezone'),
  })

  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted details.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  let businessId: string
  try {
    businessId = await createAgencyBusiness(validated.data)
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof AgencyBusinessError
          ? error.message
          : 'The business could not be added.',
    }
  }

  revalidatePath('/admin')
  redirect(`/admin/businesses/${businessId}` as Route)
}
