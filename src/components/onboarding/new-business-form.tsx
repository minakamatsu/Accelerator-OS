'use client'

import { useActionState } from 'react'
import { createBusinessAction } from '@/app/(platform)/admin/businesses/actions'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import { reportingTimezoneHint } from '@/lib/agency-business/timezones'
import { TimezoneInput } from '@/components/timezone-input'
import {
  ActionMessage,
  Field,
  fieldClass,
  SubmitButton,
} from './form-primitives'

export function NewBusinessForm() {
  const [state, action] = useActionState(
    createBusinessAction,
    initialOnboardingActionState,
  )

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Business name"
          htmlFor="new-business-name"
          error={state.errors?.name}
        >
          <input
            id="new-business-name"
            name="name"
            className={fieldClass}
            placeholder="Example: Northside Auto Care"
            required
            maxLength={160}
          />
        </Field>
        <Field
          label="Website address"
          htmlFor="new-business-website"
          hint="Optional for now. Add the live https:// address when it is ready."
          error={state.errors?.websiteUrl}
        >
          <input
            id="new-business-website"
            name="websiteUrl"
            type="url"
            className={fieldClass}
            placeholder="https://northsideauto.com"
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field
          label="Client contact"
          htmlFor="new-contact-name"
          error={state.errors?.contactName}
        >
          <input
            id="new-contact-name"
            name="contactName"
            className={fieldClass}
            placeholder="Owner or manager"
          />
        </Field>
        <Field
          label="Contact email"
          htmlFor="new-contact-email"
          error={state.errors?.contactEmail}
        >
          <input
            id="new-contact-email"
            name="contactEmail"
            type="email"
            className={fieldClass}
            placeholder="owner@example.com"
          />
        </Field>
        <Field
          label="Contact phone"
          htmlFor="new-contact-phone"
          error={state.errors?.contactPhone}
        >
          <input
            id="new-contact-phone"
            name="contactPhone"
            type="tel"
            className={fieldClass}
            placeholder="(555) 555-0123"
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_0.55fr_0.65fr]">
        <Field
          label="Street address"
          htmlFor="new-address"
          error={state.errors?.addressLine1}
        >
          <input
            id="new-address"
            name="addressLine1"
            className={fieldClass}
            placeholder="123 Main Street"
          />
        </Field>
        <Field label="City" htmlFor="new-city" error={state.errors?.city}>
          <input id="new-city" name="city" className={fieldClass} />
        </Field>
        <Field label="State" htmlFor="new-region" error={state.errors?.region}>
          <input id="new-region" name="region" className={fieldClass} />
        </Field>
        <Field
          label="ZIP code"
          htmlFor="new-postal"
          error={state.errors?.postalCode}
        >
          <input id="new-postal" name="postalCode" className={fieldClass} />
        </Field>
      </div>
      <Field
        label="Reporting timezone"
        htmlFor="new-business-timezone"
        hint={reportingTimezoneHint}
        error={state.errors?.timezone}
      >
        <TimezoneInput
          id="new-business-timezone"
          defaultValue="America/New_York"
        />
      </Field>
      <ActionMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Adding business…">
          Add business
        </SubmitButton>
      </div>
    </form>
  )
}
