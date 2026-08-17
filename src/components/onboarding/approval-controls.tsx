'use client'

import { useActionState } from 'react'
import {
  setApprovalAction,
  setBusinessStatusAction,
} from '@/app/(platform)/admin/businesses/[businessId]/onboarding/actions'
import { initialOnboardingActionState } from '@/lib/onboarding/action-state'
import type {
  OnboardingBusiness,
  OnboardingCompletion,
} from '@/lib/onboarding/types'
import { ActionMessage, SubmitButton } from './form-primitives'

function ApprovalControl({
  businessId,
  kind,
  approvedAt,
  enabled,
  blockedReason,
}: {
  businessId: string
  kind: 'facts' | 'design'
  approvedAt: string | null
  enabled: boolean
  blockedReason: string
}) {
  const action = setApprovalAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  const title = kind === 'facts' ? 'Verified facts' : 'Design direction'
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
            {approvedAt
              ? `Approved ${new Date(approvedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}`
              : blockedReason}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${approvedAt ? 'bg-[#e8f4e8] text-[#245a35]' : 'bg-[#f2efe6] text-[var(--ink-muted)]'}`}
        >
          {approvedAt ? 'Approved' : 'Pending'}
        </span>
      </div>
      <form action={formAction} className="mt-4">
        <input type="hidden" name="approval" value={kind} />
        <input
          type="hidden"
          name="approved"
          value={approvedAt ? 'false' : 'true'}
        />
        <SubmitButton
          variant={approvedAt ? 'secondary' : 'primary'}
          disabled={!approvedAt && !enabled}
          pendingLabel="Recording…"
        >
          {approvedAt ? 'Clear approval' : `Approve ${kind}`}
        </SubmitButton>
        <div className="mt-3">
          <ActionMessage state={state} />
        </div>
      </form>
    </div>
  )
}

function StatusControl({
  businessId,
  status,
  canActivate,
}: {
  businessId: string
  status: OnboardingBusiness['status']
  canActivate: boolean
}) {
  const action = setBusinessStatusAction.bind(null, businessId)
  const [state, formAction] = useActionState(
    action,
    initialOnboardingActionState,
  )
  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--ink)] p-5 text-white"
    >
      <p className="text-xs font-black tracking-[0.14em] text-[var(--signal)] uppercase">
        Delivery state
      </p>
      <p className="mt-2 text-xl font-black capitalize">{status}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">
        Activation is a deliberate final gate. Editing approved material returns
        the business to draft.
      </p>
      <label
        htmlFor="business-status"
        className="mt-5 block text-sm font-black"
      >
        Change status
      </label>
      <select
        id="business-status"
        name="status"
        defaultValue={status === 'archived' ? 'draft' : status}
        className="mt-2 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-[var(--ink)]"
      >
        <option value="draft">Draft</option>
        <option value="active" disabled={!canActivate}>
          Active
        </option>
        <option value="suspended">Suspended</option>
      </select>
      {!canActivate ? (
        <p className="mt-2 text-xs leading-5 text-white/65">
          Complete every readiness check to unlock activation.
        </p>
      ) : null}
      <div className="mt-4">
        <SubmitButton pendingLabel="Changing status…">
          Apply status
        </SubmitButton>
      </div>
      <div className="mt-3">
        <ActionMessage state={state} />
      </div>
    </form>
  )
}

export function ApprovalControls({
  business,
  completion,
}: {
  business: OnboardingBusiness
  completion: OnboardingCompletion
}) {
  return (
    <div className="grid gap-4">
      <ApprovalControl
        key={`facts-${business.factsApprovedAt ?? 'pending'}`}
        businessId={business.id}
        kind="facts"
        approvedAt={business.factsApprovedAt}
        enabled={completion.canApproveFacts}
        blockedReason={
          completion.factGaps.length
            ? `${completion.factGaps.length} fact checks remain`
            : 'Ready for recorded approval'
        }
      />
      <ApprovalControl
        key={`design-${business.designApprovedAt ?? 'pending'}`}
        businessId={business.id}
        kind="design"
        approvedAt={business.designApprovedAt}
        enabled={completion.canApproveDesign}
        blockedReason={
          completion.designGaps.length
            ? `${completion.designGaps.length} design checks remain`
            : 'Approve facts before design'
        }
      />
      <StatusControl
        key={business.status}
        businessId={business.id}
        status={business.status}
        canActivate={completion.canActivate}
      />
    </div>
  )
}
