import { z } from 'zod'
import { weekDays } from '@/lib/onboarding/types'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^https:\/\//i.test(value),
    'Use a secure https:// URL.',
  )
  .refine((value) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }, 'Enter a complete URL.')
  .transform((value) => value || null)

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => !value || z.string().email().safeParse(value).success,
    'Enter a valid email address.',
  )
  .transform((value) => value || null)

const slug = z
  .string()
  .trim()
  .min(2, 'Use at least two characters.')
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and single hyphens.',
  )

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
  }, 'Enter a valid IANA timezone, such as America/New_York.')

export const businessDraftSchema = z.object({
  name: z.string().trim().min(2, 'Enter the business name.').max(160),
  slug,
  timezone,
})

export const businessIdentitySchema = businessDraftSchema

const hoursEntrySchema = z
  .object({
    open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .nullable()

export const businessProfileSchema = z.object({
  publicPhone: optionalText(40),
  publicEmail: optionalEmail,
  websiteUrl: optionalUrl,
  addressLine1: optionalText(160),
  addressLine2: optionalText(160),
  city: optionalText(100),
  region: optionalText(100),
  postalCode: optionalText(24),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/),
  serviceArea: optionalText(500),
  mapUrl: optionalUrl,
  reviewUrl: optionalUrl,
  primaryCta: optionalText(120),
  valueProposition: optionalText(500),
  approvedOffer: optionalText(500),
  tone: optionalText(160),
  contactPreference: z.enum(['phone', 'email', 'either']).nullable(),
  factsSourceNotes: optionalText(2000),
  hours: z.object(
    Object.fromEntries(weekDays.map((day) => [day, hoursEntrySchema])),
  ),
})

const optionalColor = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^#[0-9a-f]{6}$/i.test(value),
    'Use a six-digit hex color.',
  )

export const brandSchema = z.object({
  logoTreatment: optionalText(500),
  primaryColor: optionalColor,
  accentColor: optionalColor,
  colorNotes: optionalText(500),
  imagePermissionNotes: optionalText(2000),
  typographyDirection: optionalText(500),
  shapeStyle: optionalText(120),
  motionLevel: optionalText(120),
  signatureFeature: optionalText(500),
  designNotes: optionalText(2000),
})

export const serviceSchema = z.object({
  serviceId: z.string().uuid().nullable(),
  name: z.string().trim().min(2, 'Enter a service name.').max(120),
  slug,
  shortDescription: optionalText(500),
  displayOrder: z.coerce.number().int().min(0).max(999),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
})

export const recipientSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid notification email.'),
})

export const assetSchema = z.object({
  kind: z.enum(['logo', 'photo']),
  altText: z
    .string()
    .trim()
    .min(2, 'Describe the image for accessibility.')
    .max(300),
  source: z
    .string()
    .trim()
    .min(2, 'Record where this image came from.')
    .max(500),
  permissionNotes: z
    .string()
    .trim()
    .min(2, 'Record the business’s permission or usage rights.')
    .max(2000),
})
