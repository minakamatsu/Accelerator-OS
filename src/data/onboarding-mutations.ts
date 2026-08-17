import 'server-only'
import { randomUUID } from 'node:crypto'
import type { z } from 'zod'
import { getBusinessOnboarding } from '@/data/onboarding'
import { requirePlatformAdmin } from '@/lib/auth/guards'
import { getOnboardingCompletion } from '@/lib/onboarding/completion'
import type {
  assetSchema,
  brandSchema,
  businessDraftSchema,
  businessIdentitySchema,
  businessProfileSchema,
  recipientSchema,
  serviceSchema,
} from '@/lib/onboarding/schemas'
import { createClient } from '@/lib/supabase/server'

export class OnboardingMutationError extends Error {}

async function authorizedBusiness(businessId: string) {
  const access = await requirePlatformAdmin()
  if (access.mode !== 'authenticated') {
    throw new OnboardingMutationError(
      'Connect local Supabase to edit onboarding data.',
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .maybeSingle()

  if (error || !data) {
    throw new OnboardingMutationError(
      'This business is unavailable or you no longer have access.',
    )
  }

  return supabase
}

function mutationFailed(message: string): never {
  throw new OnboardingMutationError(message)
}

export async function createBusinessDraft(
  input: z.infer<typeof businessDraftSchema>,
) {
  const access = await requirePlatformAdmin()
  if (access.mode !== 'authenticated')
    mutationFailed('Connect local Supabase to create a business.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_business_draft', {
    business_name: input.name,
    business_slug: input.slug,
    business_timezone: input.timezone,
  })

  if (error || !data) {
    mutationFailed(
      error?.code === '23505'
        ? 'That preview slug is already in use.'
        : 'The business draft could not be created.',
    )
  }

  return data
}

export async function updateBusinessIdentityRecord(
  businessId: string,
  input: z.infer<typeof businessIdentitySchema>,
) {
  const supabase = await authorizedBusiness(businessId)
  const { error } = await supabase
    .from('businesses')
    .update({ name: input.name, slug: input.slug, timezone: input.timezone })
    .eq('id', businessId)

  if (error) {
    mutationFailed(
      error.code === '23505'
        ? 'That preview slug is already in use.'
        : 'Identity changes could not be saved.',
    )
  }
}

export async function updateBusinessProfileRecord(
  businessId: string,
  input: z.infer<typeof businessProfileSchema>,
) {
  const supabase = await authorizedBusiness(businessId)
  const { error } = await supabase.from('business_profiles').upsert({
    business_id: businessId,
    public_phone: input.publicPhone,
    public_email: input.publicEmail,
    website_url: input.websiteUrl,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    region: input.region,
    postal_code: input.postalCode,
    country_code: input.countryCode,
    service_area: input.serviceArea,
    hours: input.hours,
    map_url: input.mapUrl,
    review_url: input.reviewUrl,
    primary_cta: input.primaryCta,
    value_proposition: input.valueProposition,
    approved_offer: input.approvedOffer,
    tone: input.tone,
    contact_preference: input.contactPreference,
    facts_source_notes: input.factsSourceNotes,
  })

  if (error) mutationFailed('Business facts could not be saved.')
}

export async function updateBrandRecord(
  businessId: string,
  input: z.infer<typeof brandSchema>,
) {
  const supabase = await authorizedBusiness(businessId)
  const { error } = await supabase.from('brand_settings').upsert({
    business_id: businessId,
    logo_treatment: input.logoTreatment,
    color_direction:
      input.primaryColor || input.accentColor || input.colorNotes
        ? {
            primary: input.primaryColor,
            accent: input.accentColor,
            notes: input.colorNotes,
          }
        : {},
    image_permission_notes: input.imagePermissionNotes,
    typography_direction: input.typographyDirection,
    shape_preferences: input.shapeStyle ? { style: input.shapeStyle } : {},
    motion_preferences: input.motionLevel ? { level: input.motionLevel } : {},
    signature_feature: input.signatureFeature,
    design_notes: input.designNotes,
  })

  if (error) mutationFailed('Brand direction could not be saved.')
}

export async function saveServiceRecord(
  businessId: string,
  input: z.infer<typeof serviceSchema>,
) {
  const supabase = await authorizedBusiness(businessId)
  const values = {
    name: input.name,
    slug: input.slug,
    short_description: input.shortDescription,
    display_order: input.displayOrder,
    is_featured: input.isFeatured,
    is_active: input.isActive,
  }

  const result = input.serviceId
    ? await supabase
        .from('services')
        .update(values)
        .eq('business_id', businessId)
        .eq('id', input.serviceId)
        .select('id')
        .maybeSingle()
    : await supabase
        .from('services')
        .insert({ business_id: businessId, ...values })
        .select('id')
        .single()

  if (result.error || !result.data) {
    mutationFailed(
      result.error?.code === '23505'
        ? 'That service slug is already in use for this business.'
        : 'The service could not be saved.',
    )
  }
}

export async function deleteServiceRecord(
  businessId: string,
  serviceId: string,
) {
  const supabase = await authorizedBusiness(businessId)
  const { data, error } = await supabase
    .from('services')
    .delete()
    .eq('business_id', businessId)
    .eq('id', serviceId)
    .select('id')
    .maybeSingle()

  if (error || !data) mutationFailed('The service could not be removed.')
}

export async function addRecipientRecord(
  businessId: string,
  input: z.infer<typeof recipientSchema>,
) {
  const supabase = await authorizedBusiness(businessId)
  const { error } = await supabase.from('notification_recipients').insert({
    business_id: businessId,
    recipient_address: input.email,
    enabled_event_kinds: ['lead.created'],
  })

  if (error) {
    mutationFailed(
      error.code === '23505'
        ? 'That notification address is already listed.'
        : 'The notification recipient could not be added.',
    )
  }
}

export async function deleteRecipientRecord(
  businessId: string,
  recipientId: string,
) {
  const supabase = await authorizedBusiness(businessId)
  const { data, error } = await supabase
    .from('notification_recipients')
    .delete()
    .eq('business_id', businessId)
    .eq('id', recipientId)
    .select('id')
    .maybeSingle()

  if (error || !data)
    mutationFailed('The notification recipient could not be removed.')
}

export async function uploadBusinessAssetRecord(
  businessId: string,
  input: z.infer<typeof assetSchema>,
  file: File,
) {
  const supabase = await authorizedBusiness(businessId)
  const allowedTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ])
  const extension = allowedTypes.get(file.type)

  if (!extension || file.size === 0 || file.size > 5 * 1024 * 1024) {
    mutationFailed('Choose a JPEG, PNG, or WebP image no larger than 5 MB.')
  }

  const storagePath = `${businessId}/${randomUUID()}.${extension}`
  const upload = await supabase.storage
    .from('business-assets')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })
  if (upload.error) mutationFailed('The image could not be uploaded.')

  const { error } = await supabase.from('business_assets').insert({
    business_id: businessId,
    storage_path: storagePath,
    kind: input.kind,
    alt_text: input.altText,
    source: input.source,
    permission_notes: input.permissionNotes,
  })

  if (error) {
    await supabase.storage.from('business-assets').remove([storagePath])
    mutationFailed('The image record could not be saved.')
  }
}

export async function deleteBusinessAssetRecord(
  businessId: string,
  assetId: string,
) {
  const supabase = await authorizedBusiness(businessId)
  const { data: asset, error: readError } = await supabase
    .from('business_assets')
    .select('id, storage_path')
    .eq('business_id', businessId)
    .eq('id', assetId)
    .maybeSingle()
  if (readError || !asset) mutationFailed('The image is unavailable.')

  const storageResult = await supabase.storage
    .from('business-assets')
    .remove([asset.storage_path])
  if (storageResult.error)
    mutationFailed('The stored image could not be removed.')

  const { error } = await supabase
    .from('business_assets')
    .delete()
    .eq('business_id', businessId)
    .eq('id', assetId)
  if (error) mutationFailed('The image record could not be removed.')
}

export async function setBusinessApprovalRecord(
  businessId: string,
  approval: 'facts' | 'design',
  approved: boolean,
) {
  const onboarding = await getBusinessOnboarding(businessId)
  if (!onboarding)
    mutationFailed('The business onboarding record is unavailable.')
  const completion = getOnboardingCompletion(onboarding)

  if (approved && approval === 'facts' && !completion.canApproveFacts) {
    mutationFailed(
      `Complete these fact checks first: ${completion.factGaps.join(', ')}.`,
    )
  }
  if (approved && approval === 'design' && !completion.canApproveDesign) {
    mutationFailed(`Complete and approve the facts and design direction first.`)
  }

  const supabase = await authorizedBusiness(businessId)
  const value = approved ? new Date().toISOString() : null
  const changes =
    approval === 'facts'
      ? {
          facts_approved_at: value,
          ...(approved ? {} : { design_approved_at: null }),
        }
      : { design_approved_at: value }
  const { error } = await supabase
    .from('businesses')
    .update(changes)
    .eq('id', businessId)
  if (error) mutationFailed('The approval state could not be changed.')
}

export async function setBusinessStatusRecord(
  businessId: string,
  status: 'draft' | 'active' | 'suspended',
) {
  const supabase = await authorizedBusiness(businessId)
  const { error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', businessId)
  if (error) {
    mutationFailed(
      status === 'active'
        ? 'Activation is blocked until every required fact, design input, service, recipient, and approval is complete.'
        : 'The business status could not be changed.',
    )
  }
}
