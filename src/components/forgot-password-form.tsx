'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useActionState } from 'react'
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from '@/app/(auth)/forgot-password/actions'

const initialState: ForgotPasswordState = {
  status: 'idle',
  message: null,
}

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  )

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-bold">
        Account email
        <input
          disabled={!configured || pending || state.status === 'success'}
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? 'email-error' : undefined}
          placeholder="you@business.com"
          className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 text-[var(--ink)] transition outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15 disabled:cursor-not-allowed disabled:bg-[var(--surface-hover)]"
        />
        {state.errors?.email ? (
          <span id="email-error" className="font-normal text-red-800">
            {state.errors.email[0]}
          </span>
        ) : null}
      </label>

      {state.status !== 'success' ? (
        <button
          disabled={!configured || pending}
          type="submit"
          className="min-h-12 rounded-full bg-[var(--action)] px-5 font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Sending secure link…' : 'Email me a reset link'}
        </button>
      ) : null}

      <p
        aria-live="polite"
        className={`rounded-xl p-4 text-sm leading-6 ${
          state.status === 'success'
            ? 'bg-emerald-50 text-emerald-900'
            : state.status === 'error'
              ? 'bg-red-50 text-red-900'
              : 'bg-[var(--surface-hover)] text-[var(--ink-muted)]'
        }`}
      >
        {state.message ??
          'For privacy, this screen will not reveal whether an email has an account.'}
      </p>

      <Link
        href={'/sign-in' as Route}
        className="justify-self-start text-sm font-black text-[var(--brand)]"
      >
        ← Back to sign in
      </Link>
    </form>
  )
}
