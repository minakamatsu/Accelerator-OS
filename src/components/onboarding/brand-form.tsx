'use client'

import { useActionState } from 'react'
import { updateBrandAction } from '@/app/(platform)/admin/businesses/[businessId]/onboarding/actions'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import type { OnboardingBrand } from '@/lib/onboarding/types'
import {
  ActionMessage,
  Field,
  fieldClass,
  SubmitButton,
} from './form-primitives'

export function BrandForm({
  businessId,
  brand,
}: {
  businessId: string
  brand: OnboardingBrand
}) {
  const action = updateBrandAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )

  return (
    <form action={formAction} className="grid gap-7">
      <div className="rounded-2xl border border-[#cbd7d1] bg-[#edf4f0] p-5">
        <p className="text-sm font-black text-[var(--brand)]">
          Design direction requires client approval
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Capture decisions here; do not silently choose a logo, palette,
          imagery, or personality for the business.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Logo treatment"
          htmlFor="logo-treatment"
          error={state.errors?.logoTreatment}
        >
          <textarea
            id="logo-treatment"
            name="logoTreatment"
            defaultValue={brand.logoTreatment ?? ''}
            className={`${fieldClass} min-h-28 resize-y`}
            placeholder="Existing logo, approved wordmark, or explicitly pending"
          />
        </Field>
        <Field
          label="Typography direction"
          htmlFor="typography-direction"
          error={state.errors?.typographyDirection}
        >
          <textarea
            id="typography-direction"
            name="typographyDirection"
            defaultValue={brand.typographyDirection ?? ''}
            className={`${fieldClass} min-h-28 resize-y`}
            placeholder="Describe the approved character, not a copied site"
          />
        </Field>
      </div>

      <fieldset className="grid gap-5 rounded-2xl border border-[var(--line)] p-5 sm:p-6">
        <legend className="px-2 text-lg font-black">Color direction</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Primary color"
            htmlFor="primary-color"
            error={state.errors?.primaryColor}
          >
            <input
              id="primary-color"
              name="primaryColor"
              defaultValue={brand.primaryColor}
              className={fieldClass}
              placeholder="#123B35"
            />
          </Field>
          <Field
            label="Accent color"
            htmlFor="accent-color"
            error={state.errors?.accentColor}
          >
            <input
              id="accent-color"
              name="accentColor"
              defaultValue={brand.accentColor}
              className={fieldClass}
              placeholder="#D8F23F"
            />
          </Field>
        </div>
        {brand.primaryColor && brand.accentColor ? (
          <div
            className="flex items-center gap-3"
            aria-label="Current approved color direction preview"
          >
            <span
              className="size-10 rounded-full border border-black/10"
              style={{ backgroundColor: brand.primaryColor }}
            />
            <span
              className="size-10 rounded-full border border-black/10"
              style={{ backgroundColor: brand.accentColor }}
            />
            <span className="text-sm font-bold text-[var(--ink-muted)]">
              Current color direction
            </span>
          </div>
        ) : null}
        <Field
          label="Color notes"
          htmlFor="color-notes"
          error={state.errors?.colorNotes}
        >
          <textarea
            id="color-notes"
            name="colorNotes"
            defaultValue={brand.colorNotes}
            className={`${fieldClass} min-h-24 resize-y`}
            placeholder="Mood, contrast, colors to avoid, and approval source"
          />
        </Field>
      </fieldset>

      <Field
        label="Image permissions and source rules"
        htmlFor="image-permission-notes"
        hint="State what the business owns, what it approved, and what remains unavailable."
        error={state.errors?.imagePermissionNotes}
      >
        <textarea
          id="image-permission-notes"
          name="imagePermissionNotes"
          defaultValue={brand.imagePermissionNotes ?? ''}
          className={`${fieldClass} min-h-32 resize-y`}
          maxLength={2000}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Shape and surface style"
          htmlFor="shape-style"
          error={state.errors?.shapeStyle}
        >
          <input
            id="shape-style"
            name="shapeStyle"
            defaultValue={brand.shapeStyle}
            className={fieldClass}
            placeholder="Example: crisp industrial, restrained rounding"
          />
        </Field>
        <Field
          label="Motion preference"
          htmlFor="motion-level"
          error={state.errors?.motionLevel}
        >
          <select
            id="motion-level"
            name="motionLevel"
            defaultValue={brand.motionLevel}
            className={fieldClass}
          >
            <option value="">Not decided</option>
            <option value="none">None</option>
            <option value="restrained">Restrained</option>
            <option value="expressive">
              Expressive, with reduced-motion fallback
            </option>
          </select>
        </Field>
      </div>

      <Field
        label="Business-specific signature feature"
        htmlFor="signature-feature"
        hint="A useful, distinctive interaction such as service triage, a process timeline, or a location-first experience."
        error={state.errors?.signatureFeature}
      >
        <textarea
          id="signature-feature"
          name="signatureFeature"
          defaultValue={brand.signatureFeature ?? ''}
          className={`${fieldClass} min-h-24 resize-y`}
        />
      </Field>
      <Field
        label="Design approval notes"
        htmlFor="design-notes"
        error={state.errors?.designNotes}
      >
        <textarea
          id="design-notes"
          name="designNotes"
          defaultValue={brand.designNotes ?? ''}
          className={`${fieldClass} min-h-28 resize-y`}
          placeholder="Open questions, references supplied by the client, and final approval context"
        />
      </Field>

      <ActionMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Saving brand direction…">
          Save brand direction
        </SubmitButton>
      </div>
    </form>
  )
}
