export const businessRequestTemplate = {
  key: 'business_estimate_request',
  version: 'v1',
} as const

export type BusinessRequestEmailInput = {
  businessName: string
  customerName: string
  email: string | null
  phone: string | null
  serviceRequest: string
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  message: string | null
  submittedAt: string
  timezone: string
}

function valueOrNotProvided(value: string | null): string {
  return value?.trim() || 'Not provided'
}

function vehicleLabel(input: BusinessRequestEmailInput): string {
  return (
    [input.vehicleYear?.toString(), input.vehicleMake, input.vehicleModel]
      .filter(Boolean)
      .join(' ') || 'Not provided'
  )
}

function submittedLabel(input: BusinessRequestEmailInput): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: input.timezone,
    }).format(new Date(input.submittedAt))
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(input.submittedAt))
  }
}

export function renderBusinessRequestEmail(input: BusinessRequestEmailInput): {
  subject: string
  text: string
} {
  return {
    subject: `New website estimate request from ${input.customerName}`,
    text: [
      `A new estimate request was submitted through the ${input.businessName} website.`,
      '',
      `Customer: ${input.customerName}`,
      `Phone: ${valueOrNotProvided(input.phone)}`,
      `Email: ${valueOrNotProvided(input.email)}`,
      `Vehicle: ${vehicleLabel(input)}`,
      `Requested help: ${input.serviceRequest}`,
      `Additional details: ${valueOrNotProvided(input.message)}`,
      `Submitted: ${submittedLabel(input)}`,
      '',
      'Please contact the customer using the information above. This request is not an approved estimate and no price was generated automatically.',
      '',
      'Sent by Accelerator OS website notifications.',
    ].join('\n'),
  }
}
