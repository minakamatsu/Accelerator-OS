'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { InfoTip } from '@/components/leads/info-tip'
import type { FormActionState, LeadStatus } from '@/lib/leads/schemas'
import { initialFormActionState, leadStatuses } from '@/lib/leads/schemas'
import styles from './pipeline.module.css'

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  estimate_sent: 'Estimate sent',
  won: 'Won',
  lost: 'Lost',
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  )
}

function Feedback({ state }: { state: FormActionState }) {
  if (state.status === 'idle') return null
  return (
    <p
      className={state.status === 'success' ? styles.success : styles.error}
      role={state.status === 'error' ? 'alert' : 'status'}
    >
      {state.message}
    </p>
  )
}

export function LeadActionPanel({
  currentStatus,
  currentLossReason,
  estimatedValueMinor,
  wonValueMinor,
  statusAction,
  valueAction,
  noteAction,
}: {
  currentStatus: LeadStatus
  currentLossReason: string | null
  estimatedValueMinor: number | null
  wonValueMinor: number | null
  statusAction: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>
  valueAction: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>
  noteAction: (
    state: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>
}) {
  const [statusState, statusFormAction] = useActionState(
    statusAction,
    initialFormActionState,
  )
  const [valueState, valueFormAction] = useActionState(
    valueAction,
    initialFormActionState,
  )
  const [noteState, noteFormAction] = useActionState(
    noteAction,
    initialFormActionState,
  )
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const selectedStageIndex =
    selectedStatus === 'new'
      ? 0
      : selectedStatus === 'contacted'
        ? 1
        : selectedStatus === 'estimate_sent'
          ? 2
          : 3
  const stages = [
    { label: 'New', description: 'Waiting for your first response' },
    { label: 'Contacted', description: 'Customer reached by phone or email' },
    { label: 'Estimate sent', description: 'Price or estimate shared' },
    {
      label:
        selectedStatus === 'won'
          ? 'Won'
          : selectedStatus === 'lost'
            ? 'Lost'
            : 'Outcome',
      description:
        selectedStatus === 'won'
          ? 'Request became a recorded job'
          : selectedStatus === 'lost'
            ? 'Request did not become a job'
            : 'Record whether the job was won or lost',
    },
  ]

  return (
    <section
      className={styles.actionPanel}
      aria-labelledby="request-progress-title"
    >
      <div className={styles.panelIntro}>
        <div>
          <p>Optional request tracking</p>
          <h2 id="request-progress-title">Internal progress</h2>
        </div>
        <InfoTip label="Explain optional request tracking">
          These fields are optional. If your team uses them, choose the closest
          stage after a real customer interaction.
        </InfoTip>
      </div>

      <ol className={styles.stageFlow} aria-label="Optional request stages">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            className={
              index === selectedStageIndex
                ? styles.stageActive
                : index < selectedStageIndex
                  ? styles.stageComplete
                  : undefined
            }
          >
            <span>{index + 1}</span>
            <div>
              <strong>{stage.label}</strong>
              <small>{stage.description}</small>
            </div>
          </li>
        ))}
      </ol>

      <form action={statusFormAction}>
        <div className={styles.formHeading}>
          <h3>1. Update progress</h3>
          <InfoTip label="Explain request progress">
            This is the customer&apos;s current position from first request to a
            recorded outcome.
          </InfoTip>
        </div>
        <label>
          <span>Current stage</span>
          <select
            name="status"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as LeadStatus)
            }
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        {selectedStatus === 'lost' ? (
          <label>
            <span>Why did this request not become a job?</span>
            <input
              name="lossReason"
              placeholder="For example: customer chose another shop"
              defaultValue={currentLossReason ?? ''}
              required
            />
          </label>
        ) : null}
        <Feedback state={statusState} />
        <SaveButton label="Save stage" />
      </form>

      <form action={valueFormAction}>
        <div className={styles.formHeading}>
          <h3>2. Track job value</h3>
          <InfoTip label="Explain job value">
            The estimate is the potential job amount. Record the final won
            amount only after this website request becomes a job.
          </InfoTip>
        </div>
        <div className={styles.valueFields}>
          <label>
            <span>Estimate amount</span>
            <div className={styles.moneyInput}>
              <span>$</span>
              <input
                name="estimatedValueMinor"
                inputMode="decimal"
                defaultValue={
                  estimatedValueMinor === null
                    ? ''
                    : (estimatedValueMinor / 100).toFixed(2)
                }
              />
            </div>
          </label>
          {selectedStatus === 'won' ? (
            <label>
              <span>Final won amount</span>
              <div className={styles.moneyInput}>
                <span>$</span>
                <input
                  name="wonValueMinor"
                  inputMode="decimal"
                  defaultValue={
                    wonValueMinor === null
                      ? ''
                      : (wonValueMinor / 100).toFixed(2)
                  }
                />
              </div>
            </label>
          ) : (
            <input
              type="hidden"
              name="wonValueMinor"
              value={
                wonValueMinor === null ? '' : (wonValueMinor / 100).toFixed(2)
              }
            />
          )}
        </div>
        <Feedback state={valueState} />
        <SaveButton label="Save job value" />
      </form>

      <form action={noteFormAction}>
        <div className={styles.formHeading}>
          <h3>3. Add a private note</h3>
          <InfoTip label="Explain private notes">
            Save useful details for your team, such as the customer&apos;s
            timing, preferred contact method, or agreed next step.
          </InfoTip>
        </div>
        <label>
          <span>Only your team can see this</span>
          <textarea name="body" rows={4} />
        </label>
        <Feedback state={noteState} />
        <SaveButton label="Add note" />
      </form>
    </section>
  )
}
