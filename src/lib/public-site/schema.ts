import { z } from 'zod'

const hourEntrySchema = z
  .object({
    open: z.string(),
    close: z.string(),
  })
  .nullable()

const publicSiteSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  timezone: z.string(),
  profile: z.object({
    publicPhone: z.string(),
    publicEmail: z.string().nullable(),
    addressLine1: z.string(),
    addressLine2: z.string().nullable(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    countryCode: z.string(),
    serviceArea: z.string().nullable(),
    hours: z.record(z.string(), hourEntrySchema),
    mapUrl: z.string().url().nullable(),
    primaryCta: z.string(),
    valueProposition: z.string(),
    approvedOffer: z.string().nullable(),
    tone: z.string(),
    locale: z.string(),
  }),
  brand: z.object({
    colorDirection: z.record(z.string(), z.unknown()),
    typographyDirection: z.string().nullable(),
    shapePreferences: z.record(z.string(), z.unknown()),
    motionPreferences: z.record(z.string(), z.unknown()),
    logoTreatment: z.string().nullable(),
    signatureFeature: z.string().nullable(),
  }),
  services: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      shortDescription: z.string().nullable(),
      isFeatured: z.boolean(),
    }),
  ),
  primaryHostname: z.string().nullable(),
})

export type PublicSite = z.infer<typeof publicSiteSchema>

export function parsePublicSite(value: unknown): PublicSite | null {
  const result = publicSiteSchema.safeParse(value)
  return result.success ? result.data : null
}
