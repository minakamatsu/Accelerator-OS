'use client'

import { useActionState } from 'react'
import {
  updateBusinessIdentityAction,
  updateBusinessProfileAction,
} from '@/app/(platform)/admin/businesses/[businessId]/onboarding/actions'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import type {
  OnboardingBusiness,
  OnboardingProfile,
} from '@/lib/onboarding/types'
import { weekDays } from '@/lib/onboarding/types'
import {
  ActionMessage,
  Field,
  fieldClass,
  labelClass,
  SubmitButton,
} from './form-primitives'

export function BusinessIdentityForm({
  business,
}: {
  business: OnboardingBusiness
}) {
  const action = updateBusinessIdentityAction.bind(null, business.id)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Business name"
          htmlFor="business-name"
          error={state.errors?.name}
        >
          <input
            id="business-name"
            name="name"
            defaultValue={business.name}
            className={fieldClass}
            required
            maxLength={160}
          />
        </Field>
        <Field
          label="Preview slug"
          htmlFor="business-slug"
          hint="Changing this changes the preview URL and clears approvals."
          error={state.errors?.slug}
        >
          <input
            id="business-slug"
            name="slug"
            defaultValue={business.slug}
            className={fieldClass}
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
        </Field>
      </div>
      <Field
        label="Timezone"
        htmlFor="business-timezone"
        error={state.errors?.timezone}
      >
        <input
          id="business-timezone"
          name="timezone"
          defaultValue={business.timezone}
          className={fieldClass}
          required
        />
      </Field>
      <ActionMessage state={state} />
      <div>
        <SubmitButton>Save identity</SubmitButton>
      </div>
    </form>
  )
}

export function BusinessProfileForm({
  businessId,
  profile,
}: {
  businessId: string
  profile: OnboardingProfile
}) {
  const action = updateBusinessProfileAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )

  return (
    <form action={formAction} className="grid gap-8">
      <fieldset className="grid gap-5">
        <legend className="text-lg font-black">Contact and conversion</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Public phone"
            htmlFor="public-phone"
            error={state.errors?.publicPhone}
          >
            <input
              id="public-phone"
              name="publicPhone"
              type="tel"
              autoComplete="tel"
              defaultValue={profile.publicPhone ?? ''}
              className={fieldClass}
              placeholder="Leave blank if not verified"
            />
          </Field>
          <Field
            label="Public email"
            htmlFor="public-email"
            error={state.errors?.publicEmail}
          >
            <input
              id="public-email"
              name="publicEmail"
              type="email"
              autoComplete="email"
              defaultValue={profile.publicEmail ?? ''}
              className={fieldClass}
              placeholder="Leave blank if not verified"
            />
          </Field>
          <Field
            label="Website URL"
            htmlFor="website-url"
            error={state.errors?.websiteUrl}
          >
            <input
              id="website-url"
              name="websiteUrl"
              type="url"
              defaultValue={profile.websiteUrl ?? ''}
              className={fieldClass}
              placeholder="https://"
            />
          </Field>
          <Field label="Preferred contact" htmlFor="contact-preference">
            <select
              id="contact-preference"
              name="contactPreference"
              defaultValue={profile.contactPreference ?? ''}
              className={fieldClass}
            >
              <option value="">Not confirmed</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="either">Phone or email</option>
            </select>
          </Field>
        </div>
        <Field
          label="Primary call to action"
          htmlFor="primary-cta"
          error={state.errors?.primaryCta}
        >
          <input
            id="primary-cta"
            name="primaryCta"
            defaultValue={profile.primaryCta ?? ''}
            className={fieldClass}
            placeholder="Example: Request a quote"
          />
        </Field>
        <Field
          label="Verified value proposition"
          htmlFor="value-proposition"
          hint="Use only language the business has approved. Do not add unverified claims."
          error={state.errors?.valueProposition}
        >
          <textarea
            id="value-proposition"
            name="valueProposition"
            defaultValue={profile.valueProposition ?? ''}
            className={`${fieldClass} min-h-28 resize-y`}
            maxLength={500}
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Approved offer"
            htmlFor="approved-offer"
            error={state.errors?.approvedOffer}
          >
            <textarea
              id="approved-offer"
              name="approvedOffer"
              defaultValue={profile.approvedOffer ?? ''}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="Optional; leave blank unless explicitly approved"
            />
          </Field>
          <Field
            label="Tone and language"
            htmlFor="tone"
            error={state.errors?.tone}
          >
            <textarea
              id="tone"
              name="tone"
              defaultValue={profile.tone ?? ''}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="Example: Clear, practical, never pushy"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-5 border-t border-[var(--line)] pt-8">
        <legend className="pr-4 text-lg font-black">
          Location and service area
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Address line 1"
            htmlFor="address-line-1"
            error={state.errors?.addressLine1}
          >
            <input
              id="address-line-1"
              name="addressLine1"
              autoComplete="address-line1"
              defaultValue={profile.addressLine1 ?? ''}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Address line 2"
            htmlFor="address-line-2"
            error={state.errors?.addressLine2}
          >
            <input
              id="address-line-2"
              name="addressLine2"
              autoComplete="address-line2"
              defaultValue={profile.addressLine2 ?? ''}
              className={fieldClass}
            />
          </Field>
          <Field label="City" htmlFor="city" error={state.errors?.city}>
            <input
              id="city"
              name="city"
              autoComplete="address-level2"
              defaultValue={profile.city ?? ''}
              className={fieldClass}
            />
          </Field>
          <Field
            label="State / region"
            htmlFor="region"
            error={state.errors?.region}
          >
            <input
              id="region"
              name="region"
              autoComplete="address-level1"
              defaultValue={profile.region ?? ''}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Postal code"
            htmlFor="postal-code"
            error={state.errors?.postalCode}
          >
            <input
              id="postal-code"
              name="postalCode"
              autoComplete="postal-code"
              defaultValue={profile.postalCode ?? ''}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Country code"
            htmlFor="country-code"
            error={state.errors?.countryCode}
          >
            <input
              id="country-code"
              name="countryCode"
              defaultValue={profile.countryCode}
              className={fieldClass}
              maxLength={2}
            />
          </Field>
        </div>
        <Field
          label="Service area"
          htmlFor="service-area"
          error={state.errors?.serviceArea}
        >
          <textarea
            id="service-area"
            name="serviceArea"
            defaultValue={profile.serviceArea ?? ''}
            className={`${fieldClass} min-h-24 resize-y`}
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Map URL" htmlFor="map-url" error={state.errors?.mapUrl}>
            <input
              id="map-url"
              name="mapUrl"
              type="url"
              defaultValue={profile.mapUrl ?? ''}
              className={fieldClass}
              placeholder="https://"
            />
          </Field>
          <Field
            label="Review URL"
            htmlFor="review-url"
            error={state.errors?.reviewUrl}
          >
            <input
              id="review-url"
              name="reviewUrl"
              type="url"
              defaultValue={profile.reviewUrl ?? ''}
              className={fieldClass}
              placeholder="https://"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="border-t border-[var(--line)] pt-8">
        <legend className="pr-4 text-lg font-black">Business hours</legend>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Closed days are explicit. Unknown hours should remain closed until
          verified.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)]">
          {weekDays.map((day) => {
            const entry = profile.hours[day]
            const label = `${day[0].toUpperCase()}${day.slice(1)}`
            return (
              <div
                key={day}
                className="grid gap-3 border-b border-[var(--line)] p-4 last:border-b-0 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-center"
              >
                <span className={labelClass}>{label}</span>
                <label className="text-xs font-bold text-[var(--ink-muted)]">
                  Opens
                  <input
                    type="time"
                    name={`${day}_open`}
                    defaultValue={entry?.open ?? '08:00'}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
                <label className="text-xs font-bold text-[var(--ink-muted)]">
                  Closes
                  <input
                    type="time"
                    name={`${day}_close`}
                    defaultValue={entry?.close ?? '17:00'}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    name={`${day}_closed`}
                    defaultChecked={!entry}
                    className="size-4 accent-[var(--brand)]"
                  />
                  Closed
                </label>
              </div>
            )
          })}
        </div>
      </fieldset>

      <Field
        label="Sources and verification notes"
        htmlFor="facts-source-notes"
        hint="Record where these facts came from and what still needs client confirmation."
        error={state.errors?.factsSourceNotes}
      >
        <textarea
          id="facts-source-notes"
          name="factsSourceNotes"
          defaultValue={profile.factsSourceNotes ?? ''}
          className={`${fieldClass} min-h-32 resize-y`}
          maxLength={2000}
        />
      </Field>

      <ActionMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving verified facts…">
          Save verified facts
        </SubmitButton>
        <p className="text-xs leading-5 text-[var(--ink-muted)]">
          Saving material facts clears prior approvals and returns an active
          business to draft.
        </p>
      </div>
    </form>
  )
}
