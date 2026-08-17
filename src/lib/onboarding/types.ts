export const weekDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type WeekDay = (typeof weekDays)[number]
export type HoursEntry = { open: string; close: string } | null
export type BusinessHours = Record<WeekDay, HoursEntry>

export type OnboardingBusiness = {
  id: string
  name: string
  slug: string
  category: string
  timezone: string
  status: 'draft' | 'active' | 'suspended' | 'archived'
  factsApprovedAt: string | null
  designApprovedAt: string | null
}

export type OnboardingProfile = {
  publicPhone: string | null
  publicEmail: string | null
  websiteUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  region: string | null
  postalCode: string | null
  countryCode: string
  serviceArea: string | null
  hours: BusinessHours
  mapUrl: string | null
  reviewUrl: string | null
  primaryCta: string | null
  valueProposition: string | null
  approvedOffer: string | null
  tone: string | null
  contactPreference: 'phone' | 'email' | 'either' | null
  factsSourceNotes: string | null
}

export type OnboardingBrand = {
  logoAssetId: string | null
  logoTreatment: string | null
  primaryColor: string
  accentColor: string
  colorNotes: string
  imagePermissionNotes: string | null
  typographyDirection: string | null
  shapeStyle: string
  motionLevel: string
  signatureFeature: string | null
  designNotes: string | null
}

export type OnboardingService = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  displayOrder: number
  isFeatured: boolean
  isActive: boolean
}

export type OnboardingAsset = {
  id: string
  kind: 'logo' | 'photo' | 'icon' | 'document'
  storagePath: string
  altText: string | null
  source: string | null
  permissionNotes: string | null
  previewUrl: string | null
}

export type OnboardingRecipient = {
  id: string
  address: string
  verifiedAt: string | null
}

export type OnboardingAuditEntry = {
  id: string
  action: string
  resourceType: string
  createdAt: string
}

export type BusinessOnboarding = {
  business: OnboardingBusiness
  profile: OnboardingProfile
  brand: OnboardingBrand
  services: OnboardingService[]
  assets: OnboardingAsset[]
  recipients: OnboardingRecipient[]
  audit: OnboardingAuditEntry[]
}

export type CompletionCheck = {
  key: string
  label: string
  complete: boolean
  group: 'facts' | 'design' | 'operations' | 'approval'
}

export type OnboardingCompletion = {
  checks: CompletionCheck[]
  completedCount: number
  totalCount: number
  percent: number
  factGaps: string[]
  designGaps: string[]
  activationGaps: string[]
  canApproveFacts: boolean
  canApproveDesign: boolean
  canActivate: boolean
}
