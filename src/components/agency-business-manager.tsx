'use client'

import { useActionState, useState } from 'react'
import {
  rotateAnalyticsKeyAction,
  setAgencyBusinessStatusAction,
  setAnalyticsConnectionAction,
  updateAgencyBusinessAction,
} from '@/app/(platform)/admin/businesses/[businessId]/actions'
import type { AgencyBusiness } from '@/data/agency-businesses'
import { reportingTimezoneHint } from '@/lib/agency-business/timezones'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import { TimezoneInput } from '@/components/timezone-input'
import {
  ActionMessage,
  Field,
  fieldClass,
  SubmitButton,
} from '@/components/onboarding/form-primitives'

export function AgencyBusinessDetailsForm({
  business,
}: {
  business: AgencyBusiness
}) {
  const [state, action] = useActionState(
    updateAgencyBusinessAction.bind(null, business.id),
    initialOnboardingActionState,
  )

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Business name"
          htmlFor="business-name"
          error={state.errors?.name}
        >
          <input
            id="business-name"
            name="name"
            className={fieldClass}
            defaultValue={business.name}
            required
          />
        </Field>
        <Field
          label="Live website address"
          htmlFor="website-url"
          hint="Changing the hostname pauses confirmation until the new site sends its first event."
          error={state.errors?.websiteUrl}
        >
          <input
            id="website-url"
            name="websiteUrl"
            type="url"
            className={fieldClass}
            defaultValue={business.websiteUrl ?? ''}
            placeholder="https://example.com"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field
          label="Client contact"
          htmlFor="contact-name"
          error={state.errors?.contactName}
        >
          <input
            id="contact-name"
            name="contactName"
            className={fieldClass}
            defaultValue={business.contactName ?? ''}
          />
        </Field>
        <Field
          label="Contact email"
          htmlFor="contact-email"
          error={state.errors?.contactEmail}
        >
          <input
            id="contact-email"
            name="contactEmail"
            type="email"
            className={fieldClass}
            defaultValue={business.contactEmail ?? ''}
          />
        </Field>
        <Field
          label="Contact phone"
          htmlFor="contact-phone"
          error={state.errors?.contactPhone}
        >
          <input
            id="contact-phone"
            name="contactPhone"
            type="tel"
            className={fieldClass}
            defaultValue={business.contactPhone ?? ''}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_0.55fr_0.65fr]">
        <Field
          label="Street address"
          htmlFor="address-line-1"
          error={state.errors?.addressLine1}
        >
          <input
            id="address-line-1"
            name="addressLine1"
            className={fieldClass}
            defaultValue={business.addressLine1 ?? ''}
          />
        </Field>
        <Field label="City" htmlFor="city" error={state.errors?.city}>
          <input
            id="city"
            name="city"
            className={fieldClass}
            defaultValue={business.city ?? ''}
          />
        </Field>
        <Field label="State" htmlFor="region" error={state.errors?.region}>
          <input
            id="region"
            name="region"
            className={fieldClass}
            defaultValue={business.region ?? ''}
          />
        </Field>
        <Field
          label="ZIP code"
          htmlFor="postal-code"
          error={state.errors?.postalCode}
        >
          <input
            id="postal-code"
            name="postalCode"
            className={fieldClass}
            defaultValue={business.postalCode ?? ''}
          />
        </Field>
      </div>

      <Field
        label="Reporting timezone"
        htmlFor="timezone"
        hint={reportingTimezoneHint}
        error={state.errors?.timezone}
      >
        <TimezoneInput id="timezone" defaultValue={business.timezone} />
      </Field>
      <ActionMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Saving details…">
          Save business details
        </SubmitButton>
      </div>
    </form>
  )
}

function CopySnippetButton({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--control)] px-5 py-3 text-sm font-black transition hover:bg-[var(--control-hover)]"
      onClick={async () => {
        await navigator.clipboard.writeText(snippet)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      }}
    >
      {copied ? 'Copied' : 'Copy snippet'}
    </button>
  )
}

export function AnalyticsConnectionControls({
  business,
  snippet,
}: {
  business: AgencyBusiness
  snippet: string
}) {
  const [connectionState, connectionAction] = useActionState(
    setAnalyticsConnectionAction.bind(null, business.id),
    initialOnboardingActionState,
  )
  const [rotateState, rotateAction] = useActionState(
    rotateAnalyticsKeyAction.bind(null, business.id),
    initialOnboardingActionState,
  )
  const connection = business.analytics
  const enabled =
    connection?.status === 'pending' || connection?.status === 'connected'
  const connectionTone =
    connection?.status === 'connected'
      ? 'border-emerald-400/30 bg-emerald-400/8'
      : connection?.status === 'pending'
        ? 'border-sky-400/30 bg-sky-400/8'
        : 'border-slate-400/25 bg-slate-400/8'
  const connectionBadgeTone =
    connection?.status === 'connected'
      ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
      : connection?.status === 'pending'
        ? 'border-sky-400/35 bg-sky-400/10 text-sky-200'
        : 'border-slate-400/30 bg-slate-400/10 text-slate-300'

  return (
    <div className="grid gap-5">
      <div
        className={`grid gap-3 rounded-2xl border p-5 sm:grid-cols-[1fr_auto] sm:items-center ${connectionTone}`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-lg">
              {connection?.allowedHostname ?? 'No website connected'}
            </strong>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-black tracking-wide uppercase ${connectionBadgeTone}`}
            >
              {connection?.status ?? 'disconnected'}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            {connection?.status === 'connected'
              ? `Last event received ${connection.lastEventAt ? new Date(connection.lastEventAt).toLocaleString('en-US') : 'recently'}.`
              : connection?.status === 'pending'
                ? 'Ready for installation. The status confirms after the first accepted event.'
                : 'Tracking is off. No new website events will be accepted.'}
          </p>
        </div>
        <form action={connectionAction}>
          <input
            type="hidden"
            name="enabled"
            value={enabled ? 'false' : 'true'}
          />
          <SubmitButton
            variant={enabled ? 'danger' : 'secondary'}
            pendingLabel={enabled ? 'Disabling…' : 'Enabling…'}
            disabled={!connection?.allowedHostname && !enabled}
          >
            {enabled ? 'Disable tracking' : 'Enable tracking'}
          </SubmitButton>
        </form>
      </div>
      <ActionMessage state={connectionState} />

      {connection?.allowedHostname ? (
        <div>
          <p className="text-sm font-black">Install once on every page</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Paste this before the closing body tag. Page views, phone links,
            email links, directions links marked with
            <code className="mx-1 rounded bg-[var(--control-hover)] px-1.5 py-0.5 text-xs text-[var(--brand-bright)]">
              data-accelerator-action=&quot;directions&quot;
            </code>
            and explicit accepted estimate-request events are allow-listed.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-sky-400/20 bg-[#050b0a] p-4 text-xs leading-6 text-sky-100">
            <code>{snippet}</code>
          </pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <CopySnippetButton snippet={snippet} />
            <form action={rotateAction}>
              <SubmitButton variant="danger" pendingLabel="Rotating key…">
                Rotate tracking key
              </SubmitButton>
            </form>
          </div>
          <div className="mt-4">
            <ActionMessage state={rotateState} />
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm leading-6 text-[var(--ink-muted)]">
          Save the live website address above to generate its restricted
          tracking snippet.
        </p>
      )}
    </div>
  )
}

export function BusinessLifecycleControls({
  business,
}: {
  business: AgencyBusiness
}) {
  const [state, action] = useActionState(
    setAgencyBusinessStatusAction.bind(null, business.id),
    initialOnboardingActionState,
  )

  const choices: Array<{
    status: AgencyBusiness['status']
    label: string
    variant: 'primary' | 'secondary' | 'danger'
  }> =
    business.status === 'archived'
      ? [{ status: 'draft', label: 'Restore to inactive', variant: 'primary' }]
      : [
          ...(business.status !== 'active'
            ? ([
                { status: 'active', label: 'Mark active', variant: 'primary' },
              ] as const)
            : ([
                {
                  status: 'suspended',
                  label: 'Pause business',
                  variant: 'secondary',
                },
              ] as const)),
          {
            status: 'archived',
            label: 'Remove from roster',
            variant: 'danger',
          },
        ]

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3">
        {choices.map((choice) => (
          <form key={choice.status} action={action}>
            <input type="hidden" name="status" value={choice.status} />
            <SubmitButton variant={choice.variant} pendingLabel="Updating…">
              {choice.label}
            </SubmitButton>
          </form>
        ))}
      </div>
      <ActionMessage state={state} />
      <p className="text-xs leading-5 text-[var(--ink-muted)]">
        Removing a business archives it and disables new tracking. Analytics and
        account data are preserved so it can be restored later.
      </p>
    </div>
  )
}
