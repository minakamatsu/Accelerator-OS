'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import type { OnboardingActionState } from '@/lib/onboarding/action-state'

export const fieldClass =
  'mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 py-3 text-[15px] text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--brand-bright)] focus:ring-4 focus:ring-[color:var(--brand-bright)]/15'
export const labelClass = 'text-sm font-black text-[var(--ink)]'
export const helpClass = 'mt-2 text-xs leading-5 text-[var(--ink-muted)]'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string[]
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className={helpClass}>{hint}</p> : null}
      {error?.length ? (
        <p
          className="mt-2 text-sm font-bold text-[var(--danger-ink)]"
          id={`${htmlFor}-error`}
        >
          {error[0]}
        </p>
      ) : null}
    </div>
  )
}

export function ActionMessage({ state }: { state: OnboardingActionState }) {
  if (!state.message) return null
  return (
    <p
      aria-live="polite"
      className={`rounded-xl px-4 py-3 text-sm font-bold ${
        state.status === 'success'
          ? 'bg-[var(--success-soft)] text-[var(--success-ink)]'
          : 'bg-[var(--danger-soft)] text-[var(--danger-ink)]'
      }`}
    >
      {state.message}
    </p>
  )
}

export function SubmitButton({
  children,
  pendingLabel = 'Saving…',
  variant = 'primary',
  disabled = false,
}: {
  children: ReactNode
  pendingLabel?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const styles = {
    primary:
      'bg-[var(--action)] text-[var(--action-text)] hover:bg-[var(--action-hover)]',
    secondary:
      'border border-[var(--line)] bg-[var(--control)] text-[var(--ink)] hover:bg-[var(--control-hover)]',
    danger:
      'border border-[var(--danger-line)] bg-[var(--control)] text-[var(--danger-ink)] hover:bg-[var(--danger-soft)]',
  }

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}

export function SectionCard({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-strong)] shadow-[0_18px_50px_rgb(16_35_31_/_0.06)]"
    >
      <header className="border-b border-[var(--line)] bg-[linear-gradient(120deg,rgba(216,242,63,0.12),transparent_55%)] p-6 sm:p-8">
        <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
          {description}
        </p>
      </header>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  )
}
