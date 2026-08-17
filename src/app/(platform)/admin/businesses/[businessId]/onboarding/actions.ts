'use server'

import { revalidatePath } from 'next/cache'
import {
  addRecipientRecord,
  deleteBusinessAssetRecord,
  deleteRecipientRecord,
  deleteServiceRecord,
  OnboardingMutationError,
  saveServiceRecord,
  setBusinessApprovalRecord,
  setBusinessStatusRecord,
  updateBrandRecord,
  updateBusinessIdentityRecord,
  updateBusinessProfileRecord,
  uploadBusinessAssetRecord,
} from '@/data/onboarding-mutations'
import type { OnboardingActionState } from '@/lib/onboarding/action-state'
import { parseHoursForm, validateBusinessHours } from '@/lib/onboarding/hours'
import {
  assetSchema,
  brandSchema,
  businessIdentitySchema,
  businessProfileSchema,
  recipientSchema,
  serviceSchema,
} from '@/lib/onboarding/schemas'

function resultError(error: unknown, fallback: string): OnboardingActionState {
  return {
    status: 'error',
    message:
      error instanceof OnboardingMutationError ? error.message : fallback,
  }
}

function refreshOnboarding(businessId: string) {
  revalidatePath('/admin')
  revalidatePath(`/admin/businesses/${businessId}/onboarding`)
}

export async function updateBusinessIdentityAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validated = businessIdentitySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    timezone: formData.get('timezone'),
  })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted identity fields.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    await updateBusinessIdentityRecord(businessId, validated.data)
    refreshOnboarding(businessId)
    return { status: 'success', message: 'Business identity saved.' }
  } catch (error) {
    return resultError(error, 'Business identity could not be saved.')
  }
}

export async function updateBusinessProfileAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const hours = parseHoursForm(formData)
  const hoursError = validateBusinessHours(hours)
  if (hoursError) return { status: 'error', message: hoursError }

  const contactPreference = formData.get('contactPreference')
  const validated = businessProfileSchema.safeParse({
    publicPhone: formData.get('publicPhone'),
    publicEmail: formData.get('publicEmail'),
    websiteUrl: formData.get('websiteUrl'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2'),
    city: formData.get('city'),
    region: formData.get('region'),
    postalCode: formData.get('postalCode'),
    countryCode: formData.get('countryCode'),
    serviceArea: formData.get('serviceArea'),
    mapUrl: formData.get('mapUrl'),
    reviewUrl: formData.get('reviewUrl'),
    primaryCta: formData.get('primaryCta'),
    valueProposition: formData.get('valueProposition'),
    approvedOffer: formData.get('approvedOffer'),
    tone: formData.get('tone'),
    contactPreference: contactPreference ? String(contactPreference) : null,
    factsSourceNotes: formData.get('factsSourceNotes'),
    hours,
  })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted business facts.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    await updateBusinessProfileRecord(businessId, validated.data)
    refreshOnboarding(businessId)
    return {
      status: 'success',
      message: 'Verified facts saved. Any prior approvals were cleared.',
    }
  } catch (error) {
    return resultError(error, 'Business facts could not be saved.')
  }
}

export async function updateBrandAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validated = brandSchema.safeParse({
    logoTreatment: formData.get('logoTreatment'),
    primaryColor: formData.get('primaryColor'),
    accentColor: formData.get('accentColor'),
    colorNotes: formData.get('colorNotes'),
    imagePermissionNotes: formData.get('imagePermissionNotes'),
    typographyDirection: formData.get('typographyDirection'),
    shapeStyle: formData.get('shapeStyle'),
    motionLevel: formData.get('motionLevel'),
    signatureFeature: formData.get('signatureFeature'),
    designNotes: formData.get('designNotes'),
  })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted brand fields.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    await updateBrandRecord(businessId, validated.data)
    refreshOnboarding(businessId)
    return {
      status: 'success',
      message: 'Brand direction saved. Any prior design approval was cleared.',
    }
  } catch (error) {
    return resultError(error, 'Brand direction could not be saved.')
  }
}

export async function saveServiceAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const serviceId = String(formData.get('serviceId') ?? '') || null
  const validated = serviceSchema.safeParse({
    serviceId,
    name: formData.get('name'),
    slug: formData.get('slug'),
    shortDescription: formData.get('shortDescription'),
    displayOrder: formData.get('displayOrder') || 0,
    isFeatured: formData.get('isFeatured') === 'on',
    isActive: formData.get('isActive') === 'on',
  })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the service details.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    await saveServiceRecord(businessId, validated.data)
    refreshOnboarding(businessId)
    return {
      status: 'success',
      message: serviceId ? 'Service updated.' : 'Service added.',
    }
  } catch (error) {
    return resultError(error, 'The service could not be saved.')
  }
}

export async function deleteServiceAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const serviceId = String(formData.get('serviceId') ?? '')
  if (!serviceId)
    return { status: 'error', message: 'Choose a service to remove.' }
  try {
    await deleteServiceRecord(businessId, serviceId)
    refreshOnboarding(businessId)
    return { status: 'success', message: 'Service removed.' }
  } catch (error) {
    return resultError(error, 'The service could not be removed.')
  }
}

export async function addRecipientAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validated = recipientSchema.safeParse({ email: formData.get('email') })
  if (!validated.success) {
    return {
      status: 'error',
      message: 'Enter a valid notification email.',
      errors: validated.error.flatten().fieldErrors,
    }
  }
  try {
    await addRecipientRecord(businessId, validated.data)
    refreshOnboarding(businessId)
    return { status: 'success', message: 'Notification recipient added.' }
  } catch (error) {
    return resultError(error, 'The notification recipient could not be added.')
  }
}

export async function deleteRecipientAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const recipientId = String(formData.get('recipientId') ?? '')
  if (!recipientId)
    return { status: 'error', message: 'Choose a recipient to remove.' }
  try {
    await deleteRecipientRecord(businessId, recipientId)
    refreshOnboarding(businessId)
    return { status: 'success', message: 'Notification recipient removed.' }
  } catch (error) {
    return resultError(
      error,
      'The notification recipient could not be removed.',
    )
  }
}

export async function uploadAssetAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const validated = assetSchema.safeParse({
    kind: formData.get('kind'),
    altText: formData.get('altText'),
    source: formData.get('source'),
    permissionNotes: formData.get('permissionNotes'),
  })
  const file = formData.get('file')
  if (!validated.success || !(file instanceof File)) {
    return {
      status: 'error',
      message:
        'Choose an image and complete its source, rights, and description.',
      errors: validated.success
        ? undefined
        : validated.error.flatten().fieldErrors,
    }
  }
  try {
    await uploadBusinessAssetRecord(businessId, validated.data, file)
    refreshOnboarding(businessId)
    return {
      status: 'success',
      message: 'Image uploaded with its rights record.',
    }
  } catch (error) {
    return resultError(error, 'The image could not be uploaded.')
  }
}

export async function deleteAssetAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const assetId = String(formData.get('assetId') ?? '')
  if (!assetId)
    return { status: 'error', message: 'Choose an image to remove.' }
  try {
    await deleteBusinessAssetRecord(businessId, assetId)
    refreshOnboarding(businessId)
    return { status: 'success', message: 'Image removed.' }
  } catch (error) {
    return resultError(error, 'The image could not be removed.')
  }
}

export async function setApprovalAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const approval = formData.get('approval')
  if (approval !== 'facts' && approval !== 'design') {
    return { status: 'error', message: 'Choose a valid approval step.' }
  }
  const approved = formData.get('approved') === 'true'
  try {
    await setBusinessApprovalRecord(businessId, approval, approved)
    refreshOnboarding(businessId)
    return {
      status: 'success',
      message: `${approval === 'facts' ? 'Facts' : 'Design'} ${approved ? 'approved' : 'approval cleared'}.`,
    }
  } catch (error) {
    return resultError(error, 'The approval state could not be changed.')
  }
}

export async function setBusinessStatusAction(
  businessId: string,
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const status = formData.get('status')
  if (status !== 'draft' && status !== 'active' && status !== 'suspended') {
    return { status: 'error', message: 'Choose a valid business status.' }
  }
  try {
    await setBusinessStatusRecord(businessId, status)
    refreshOnboarding(businessId)
    return { status: 'success', message: `Business moved to ${status}.` }
  } catch (error) {
    return resultError(error, 'The business status could not be changed.')
  }
}
