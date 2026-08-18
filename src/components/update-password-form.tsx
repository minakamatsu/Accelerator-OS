'use client'

import { useActionState } from 'react'
import {
  updatePassword,
  type UpdatePasswordState,
} from '@/app/(auth)/update-password/actions'

const initialState: UpdatePasswordState = { message: null }

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState)

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-bold">
        New password
        <input
          disabled={pending}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby="password-guidance password-error"
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-[var(--ink)] transition outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15"
        />
        <span
          id="password-guidance"
          className="leading-5 font-normal text-[var(--ink-muted)]"
        >
          At least 12 characters with uppercase, lowercase, a number, and a
          symbol.
        </span>
        {state.errors?.password ? (
          <span id="password-error" className="font-normal text-red-800">
            {state.errors.password[0]}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Confirm new password
        <input
          disabled={pending}
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.errors?.confirmation)}
          aria-describedby={
            state.errors?.confirmation ? 'confirmation-error' : undefined
          }
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-[var(--ink)] transition outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15"
        />
        {state.errors?.confirmation ? (
          <span id="confirmation-error" className="font-normal text-red-800">
            {state.errors.confirmation[0]}
          </span>
        ) : null}
      </label>

      <button
        disabled={pending}
        type="submit"
        className="min-h-12 rounded-full bg-[var(--ink)] px-5 font-black text-white transition hover:bg-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? 'Securing account…'
          : 'Save password and sign out everywhere'}
      </button>

      <p aria-live="polite" className="text-sm leading-6 text-red-800">
        {state.message}
      </p>
    </form>
  )
}
