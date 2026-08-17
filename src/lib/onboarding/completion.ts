import type {
  BusinessOnboarding,
  CompletionCheck,
  OnboardingCompletion,
} from '@/lib/onboarding/types'

function present(value: string | null | undefined) {
  return Boolean(value?.trim())
}

export function getOnboardingCompletion(
  onboarding: BusinessOnboarding,
): OnboardingCompletion {
  const { business, profile, brand, recipients } = onboarding
  const hasHours = Object.values(profile.hours).some(Boolean)
  const hasColors = Boolean(brand.primaryColor && brand.accentColor)

  const checks: CompletionCheck[] = [
    {
      key: 'identity',
      label: 'Business identity',
      complete: present(business.name) && present(business.slug),
      group: 'facts',
    },
    {
      key: 'contact',
      label: 'Public contact',
      complete: present(profile.publicPhone),
      group: 'facts',
    },
    {
      key: 'location',
      label: 'Location',
      complete:
        present(profile.addressLine1) &&
        present(profile.city) &&
        present(profile.region) &&
        present(profile.postalCode),
      group: 'facts',
    },
    {
      key: 'hours',
      label: 'Business hours',
      complete: hasHours,
      group: 'facts',
    },
    {
      key: 'message',
      label: 'CTA and value proposition',
      complete:
        present(profile.primaryCta) &&
        present(profile.valueProposition) &&
        present(profile.tone),
      group: 'facts',
    },
    {
      key: 'sources',
      label: 'Fact sources recorded',
      complete: present(profile.factsSourceNotes),
      group: 'facts',
    },
    {
      key: 'brand',
      label: 'Brand direction',
      complete:
        present(brand.logoTreatment) &&
        hasColors &&
        present(brand.typographyDirection) &&
        present(brand.imagePermissionNotes),
      group: 'design',
    },
    {
      key: 'notifications',
      label: 'Notification recipient',
      complete: recipients.length > 0,
      group: 'operations',
    },
    {
      key: 'facts-approval',
      label: 'Facts approved',
      complete: Boolean(business.factsApprovedAt),
      group: 'approval',
    },
    {
      key: 'design-approval',
      label: 'Design approved',
      complete: Boolean(business.designApprovedAt),
      group: 'approval',
    },
  ]

  const factGaps = checks
    .filter((check) => check.group === 'facts')
    .filter((check) => !check.complete)
    .map((check) => check.label)
  const designGaps = checks
    .filter((check) => check.group === 'design')
    .filter((check) => !check.complete)
    .map((check) => check.label)
  const activationGaps = checks
    .filter((check) => !check.complete)
    .map((check) => check.label)
  const completedCount = checks.filter((check) => check.complete).length

  return {
    checks,
    completedCount,
    totalCount: checks.length,
    percent: Math.round((completedCount / checks.length) * 100),
    factGaps,
    designGaps,
    activationGaps,
    canApproveFacts: factGaps.length === 0,
    canApproveDesign:
      factGaps.length === 0 &&
      Boolean(business.factsApprovedAt) &&
      designGaps.length === 0,
    canActivate: activationGaps.length === 0,
  }
}
