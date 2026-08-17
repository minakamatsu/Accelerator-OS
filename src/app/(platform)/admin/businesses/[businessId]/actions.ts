'use server'

import { revalidatePath } from 'next/cache'
import {
  AgencyBusinessError,
  rotateAnalyticsSiteKey,
  setAgencyBusinessStatus,
  setAnalyticsConnectionEnabled,
  updateAgencyBusiness,
  type BusinessLifecycle,
} from '@/data/agency-businesses'
import { agencyBusinessSchema } from '@/lib/agency-business/schema'
import type { OnboardingActionState } from '@/lib/onboarding/action-state'

function errorState(error: unknown, fallback: string): OnboardingActionState {
  return {
    status: 'error',
    message: error instanceof AgencyBusinessError ? error.message : fallback,
  }
}

function refreshBusiness(businessId: string) {
  revalidatePath('/admin')
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath(`/portal/businesses/${businessId}`)
}

export async function updateAgencyBusinessAction(
  businessId: string,
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

  try {
    await updateAgencyBusiness(businessId, validated.data)
    refreshBusiness(businessId)
    return { status: 'success', message: 'Business details saved.' }
  } catch (error) {
    return errorState(error, 'The business details could not be saved.')
  }
}

export async function setAgencyBusinessStatusAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const status = formData.get('status')
  const allowed: BusinessLifecycle[] = [
    'draft',
    'active',
    'suspended',
    'archived',
  ]
  if (!allowed.includes(status as BusinessLifecycle)) {
    return { status: 'error', message: 'Choose a valid business status.' }
  }
  try {
    await setAgencyBusinessStatus(businessId, status as BusinessLifecycle)
    refreshBusiness(businessId)
    const message =
      status === 'archived'
        ? 'Business removed from the active roster. Its data was preserved.'
        : status === 'draft'
          ? 'Business restored as inactive.'
          : `Business marked ${status}.`
    return { status: 'success', message }
  } catch (error) {
    return errorState(error, 'The business status could not be changed.')
  }
}

export async function setAnalyticsConnectionAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const enabled = formData.get('enabled') === 'true'
  try {
    await setAnalyticsConnectionEnabled(businessId, enabled)
    refreshBusiness(businessId)
    return {
      status: 'success',
      message: enabled
        ? 'Analytics connection enabled. It will confirm after the first event arrives.'
        : 'Analytics connection disabled. New events are blocked.',
    }
  } catch (error) {
    return errorState(error, 'The analytics connection could not be changed.')
  }
}

export async function rotateAnalyticsKeyAction(
  businessId: string,
  _previousState: OnboardingActionState,
): Promise<OnboardingActionState> {
  void _previousState
  try {
    await rotateAnalyticsSiteKey(businessId)
    refreshBusiness(businessId)
    return {
      status: 'success',
      message:
        'Tracking key rotated. Replace the old snippet on the website; the old key no longer records events.',
    }
  } catch (error) {
    return errorState(error, 'The analytics key could not be rotated.')
  }
}
