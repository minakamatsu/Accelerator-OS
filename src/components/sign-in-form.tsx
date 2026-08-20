'use client'

import type { Route } from 'next'
import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type SignInState } from '@/app/(auth)/sign-in/actions'

const initialSignInState: SignInState = { message: null }

export function SignInForm({
  configured,
  nextPath,
}: {
  configured: boolean
  nextPath: string
}) {
  const [state, action, pending] = useActionState(signIn, initialSignInState)

  return (
    <form
      action={action}
      className="mt-8 grid gap-5"
      aria-describedby="auth-status"
    >
      <input type="hidden" name="next" value={nextPath} />
      <label className="grid gap-2 text-sm font-bold">
        Email address
        <input
          disabled={!configured || pending}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? 'email-error' : undefined}
          placeholder="you@business.com"
          className="rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 py-3 text-[var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)]"
        />
        {state.errors?.email && (
          <span id="email-error" className="text-sm font-normal text-red-800">
            {state.errors.email[0]}
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Password
        <input
          disabled={!configured || pending}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={
            state.errors?.password ? 'password-error' : undefined
          }
          placeholder="••••••••"
          className="rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 py-3 text-[var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)]"
        />
        {state.errors?.password && (
          <span
            id="password-error"
            className="text-sm font-normal text-red-800"
          >
            {state.errors.password[0]}
          </span>
        )}
      </label>
      <div className="-mt-2 flex justify-end">
        <Link
          href={'/forgot-password' as Route}
          className="text-sm font-bold text-[var(--brand)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-current"
        >
          Forgot password?
        </Link>
      </div>
      <button
        disabled={!configured || pending}
        type="submit"
        className="rounded-full bg-[var(--action)] px-5 py-3 font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? 'Signing in…'
          : configured
            ? 'Sign in securely'
            : 'Authentication not connected'}
      </button>
      <p
        id="auth-status"
        aria-live="polite"
        className="text-sm leading-6 text-[var(--ink-muted)]"
      >
        {state.message ??
          (configured
            ? 'Credentials are verified by Supabase Auth and are not stored by this application.'
            : 'No data entered here is submitted or stored.')}
      </p>
    </form>
  )
}
