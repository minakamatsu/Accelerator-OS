import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (value) => !value || z.string().email().safeParse(value).success,
    'Enter a valid email address.',
  )
  .transform((value) => value || null)

const optionalWebsite = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^https:\/\//i.test(value),
    'Use the complete secure address beginning with https://.',
  )
  .refine((value) => {
    if (!value) return true
    try {
      const url = new URL(value)
      return url.protocol === 'https:' && Boolean(url.hostname)
    } catch {
      return false
    }
  }, 'Enter a complete website address.')
  .transform((value) => value || null)

const timezone = z
  .string()
  .trim()
  .max(80)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value })
      return true
    } catch {
      return false
    }
  }, 'Enter a valid timezone, such as America/New_York.')

export const agencyBusinessSchema = z.object({
  name: z.string().trim().min(2, 'Enter the business name.').max(160),
  contactName: optionalText(160),
  contactEmail: optionalEmail,
  contactPhone: optionalText(40),
  websiteUrl: optionalWebsite,
  addressLine1: optionalText(160),
  city: optionalText(100),
  region: optionalText(100),
  postalCode: optionalText(24),
  timezone,
})

export function websiteHostname(websiteUrl: string | null): string | null {
  if (!websiteUrl) return null
  return new URL(websiteUrl).hostname.toLowerCase().replace(/\.$/, '')
}

export function internalBusinessSlug(name: string, uniqueSuffix: string) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 56)
  return `${base || 'business'}-${uniqueSuffix}`
}
