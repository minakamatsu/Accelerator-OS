'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { FormActionState } from '@/lib/leads/schemas'
import { initialFormActionState } from '@/lib/leads/schemas'
import { getAnalyticsVisitorId } from '@/lib/analytics/browser'
import { TurnstileWidget } from './turnstile-widget'
import styles from './quote-form.module.css'

type ServiceOption = { slug: string; name: string }

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null
  return (
    <p className={styles.fieldError} id={id}>
      {errors[0]}
    </p>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      <span>{pending ? 'Sending request…' : 'Send service request'}</span>
      <strong aria-hidden="true">→</strong>
    </button>
  )
}

export function QuoteForm({
  action,
  services,
  idempotencyKey,
  consentText,
  turnstileSiteKey,
  attribution,
}: {
  action: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>
  services: ServiceOption[]
  idempotencyKey: string
  consentText: string
  turnstileSiteKey: string | null
  attribution: {
    source: string
    utmSource: string
    utmMedium: string
    utmCampaign: string
  }
}) {
  const [state, formAction] = useActionState(action, initialFormActionState)
  const [startedAt] = useState(() => Date.now())
  const analyticsVisitorIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (analyticsVisitorIdRef.current) {
      analyticsVisitorIdRef.current.value = getAnalyticsVisitorId()
    }
  }, [])

  if (state.status === 'success') {
    return (
      <div className={styles.successState} role="status">
        <span aria-hidden="true">✓</span>
        <p>Request received</p>
        <h2>Thanks. The details are ready for the shop.</h2>
        <p>{state.message}</p>
      </div>
    )
  }

  const errorFor = (name: string) => state.fieldErrors?.[name]

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="source" value={attribution.source} />
      <input type="hidden" name="utmSource" value={attribution.utmSource} />
      <input type="hidden" name="utmMedium" value={attribution.utmMedium} />
      <input type="hidden" name="utmCampaign" value={attribution.utmCampaign} />
      <input
        ref={analyticsVisitorIdRef}
        type="hidden"
        name="analyticsVisitorId"
      />

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.formIntro}>
        <p>Step 1 of 1</p>
        <h2>Tell the shop what changed.</h2>
        <span>Plain language is enough. Required fields are marked.</span>
      </div>

      {state.status === 'error' ? (
        <div className={styles.formError} role="alert">
          {state.message}
        </div>
      ) : null}

      <fieldset>
        <legend>Your contact details</legend>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Full name *</span>
            <input
              name="fullName"
              autoComplete="name"
              aria-invalid={Boolean(errorFor('fullName'))}
              aria-describedby={
                errorFor('fullName') ? 'fullName-error' : undefined
              }
            />
            <FieldError errors={errorFor('fullName')} id="fullName-error" />
          </label>
          <label className={styles.field}>
            <span>Phone number</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errorFor('phone'))}
              aria-describedby={errorFor('phone') ? 'phone-error' : undefined}
            />
            <FieldError errors={errorFor('phone')} id="phone-error" />
          </label>
          <label className={styles.field}>
            <span>Email address</span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={Boolean(errorFor('email'))}
              aria-describedby={errorFor('email') ? 'email-error' : undefined}
            />
            <FieldError errors={errorFor('email')} id="email-error" />
          </label>
        </div>
        <p className={styles.fieldHint}>
          Provide a phone number, email, or both.
        </p>
      </fieldset>

      <fieldset>
        <legend>Vehicle and request</legend>
        <label className={styles.field}>
          <span>Closest service category</span>
          <select name="serviceSlug" defaultValue="">
            <option value="">Not sure / another concern</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.vehicleGrid}>
          <label className={styles.field}>
            <span>Year</span>
            <input
              name="vehicleYear"
              inputMode="numeric"
              maxLength={4}
              aria-invalid={Boolean(errorFor('vehicleYear'))}
              aria-describedby={
                errorFor('vehicleYear') ? 'vehicleYear-error' : undefined
              }
            />
            <FieldError
              errors={errorFor('vehicleYear')}
              id="vehicleYear-error"
            />
          </label>
          <label className={styles.field}>
            <span>Make</span>
            <input name="vehicleMake" autoComplete="off" />
          </label>
          <label className={styles.field}>
            <span>Model</span>
            <input name="vehicleModel" autoComplete="off" />
          </label>
        </div>
        <label className={styles.field}>
          <span>What are you noticing? *</span>
          <textarea
            name="serviceRequest"
            rows={5}
            placeholder="For example: when it started, what you hear or feel, and any warning light you noticed."
            aria-invalid={Boolean(errorFor('serviceRequest'))}
            aria-describedby={
              errorFor('serviceRequest') ? 'serviceRequest-error' : undefined
            }
          />
          <FieldError
            errors={errorFor('serviceRequest')}
            id="serviceRequest-error"
          />
        </label>
        <label className={styles.field}>
          <span>Anything else the shop should know?</span>
          <textarea name="message" rows={3} />
        </label>
      </fieldset>

      <label className={styles.consent}>
        <input
          name="consent"
          type="checkbox"
          value="on"
          aria-invalid={Boolean(errorFor('consent'))}
          aria-describedby={errorFor('consent') ? 'consent-error' : undefined}
        />
        <span>{consentText}</span>
      </label>
      <FieldError errors={errorFor('consent')} id="consent-error" />

      <TurnstileWidget siteKey={turnstileSiteKey} />
      <SubmitButton />
      <p className={styles.privacyNote}>
        Your details are used for this service request and stored securely for
        the shop. No estimate is created automatically.
      </p>
    </form>
  )
}
