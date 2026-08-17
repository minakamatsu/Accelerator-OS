import 'server-only'
import { requirePlatformAdmin } from '@/lib/auth/guards'
import { normalizeBusinessHours } from '@/lib/onboarding/hours'
import type { BusinessOnboarding } from '@/lib/onboarding/types'
import { createClient } from '@/lib/supabase/server'

function jsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function jsonText(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string' ? record[key] : ''
}

export async function getBusinessOnboarding(
  businessId: string,
): Promise<BusinessOnboarding | null> {
  const access = await requirePlatformAdmin()
  if (access.mode === 'development') return null

  const supabase = await createClient()
  const [
    businessResult,
    profileResult,
    brandResult,
    servicesResult,
    assetsResult,
    recipientsResult,
    auditResult,
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select(
        'id, name, slug, category, timezone, status, facts_approved_at, design_approved_at',
      )
      .eq('id', businessId)
      .maybeSingle(),
    supabase
      .from('business_profiles')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle(),
    supabase
      .from('brand_settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle(),
    supabase
      .from('services')
      .select(
        'id, name, slug, short_description, display_order, is_featured, is_active',
      )
      .eq('business_id', businessId)
      .order('display_order')
      .order('name'),
    supabase
      .from('business_assets')
      .select('id, kind, storage_path, alt_text, source, permission_notes')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
    supabase
      .from('notification_recipients')
      .select('id, recipient_address, verified_at')
      .eq('business_id', businessId)
      .order('created_at'),
    supabase
      .from('audit_log')
      .select('id, action, resource_type, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  if (businessResult.error) throw new Error('Unable to load the business.')
  if (!businessResult.data) return null

  const relatedResults = [
    profileResult,
    brandResult,
    servicesResult,
    assetsResult,
    recipientsResult,
    auditResult,
  ]
  if (relatedResults.some((result) => result.error)) {
    throw new Error('Unable to load the onboarding workspace.')
  }

  const profile = profileResult.data
  const brand = brandResult.data
  const colorDirection = jsonRecord(brand?.color_direction)
  const shapePreferences = jsonRecord(brand?.shape_preferences)
  const motionPreferences = jsonRecord(brand?.motion_preferences)
  const assets = assetsResult.data ?? []

  return {
    business: {
      id: businessResult.data.id,
      name: businessResult.data.name,
      slug: businessResult.data.slug,
      category: businessResult.data.category,
      timezone: businessResult.data.timezone,
      status: businessResult.data.status,
      factsApprovedAt: businessResult.data.facts_approved_at,
      designApprovedAt: businessResult.data.design_approved_at,
    },
    profile: {
      publicPhone: profile?.public_phone ?? null,
      publicEmail: profile?.public_email ?? null,
      websiteUrl: profile?.website_url ?? null,
      addressLine1: profile?.address_line_1 ?? null,
      addressLine2: profile?.address_line_2 ?? null,
      city: profile?.city ?? null,
      region: profile?.region ?? null,
      postalCode: profile?.postal_code ?? null,
      countryCode: profile?.country_code ?? 'US',
      serviceArea: profile?.service_area ?? null,
      hours: normalizeBusinessHours(profile?.hours),
      mapUrl: profile?.map_url ?? null,
      reviewUrl: profile?.review_url ?? null,
      primaryCta: profile?.primary_cta ?? null,
      valueProposition: profile?.value_proposition ?? null,
      approvedOffer: profile?.approved_offer ?? null,
      tone: profile?.tone ?? null,
      contactPreference:
        profile?.contact_preference === 'phone' ||
        profile?.contact_preference === 'email' ||
        profile?.contact_preference === 'either'
          ? profile.contact_preference
          : null,
      factsSourceNotes: profile?.facts_source_notes ?? null,
    },
    brand: {
      logoAssetId: brand?.logo_asset_id ?? null,
      logoTreatment: brand?.logo_treatment ?? null,
      primaryColor: jsonText(colorDirection, 'primary'),
      accentColor: jsonText(colorDirection, 'accent'),
      colorNotes: jsonText(colorDirection, 'notes'),
      imagePermissionNotes: brand?.image_permission_notes ?? null,
      typographyDirection: brand?.typography_direction ?? null,
      shapeStyle: jsonText(shapePreferences, 'style'),
      motionLevel: jsonText(motionPreferences, 'level'),
      signatureFeature: brand?.signature_feature ?? null,
      designNotes: brand?.design_notes ?? null,
    },
    services: (servicesResult.data ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      shortDescription: service.short_description,
      displayOrder: service.display_order,
      isFeatured: service.is_featured,
      isActive: service.is_active,
    })),
    assets: assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind,
      storagePath: asset.storage_path,
      altText: asset.alt_text,
      source: asset.source,
      permissionNotes: asset.permission_notes,
      previewUrl: `/api/business-assets/${asset.id}`,
    })),
    recipients: (recipientsResult.data ?? []).map((recipient) => ({
      id: recipient.id,
      address: recipient.recipient_address,
      verifiedAt: recipient.verified_at,
    })),
    audit: (auditResult.data ?? []).map((entry) => ({
      id: entry.id,
      action: entry.action,
      resourceType: entry.resource_type,
      createdAt: entry.created_at,
    })),
  }
}
