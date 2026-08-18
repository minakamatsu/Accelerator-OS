'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type GateMode = 'loading' | 'enroll' | 'challenge'

type GateState = {
  mode: GateMode
  factorId: string | null
  challengeId: string | null
  qrCode: string | null
  secret: string | null
  error: string | null
}

const initialState: GateState = {
  mode: 'loading',
  factorId: null,
  challengeId: null,
  qrCode: null,
  secret: null,
  error: null,
}

export function MfaGate({ nextPath }: { nextPath: Route }) {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [state, setState] = useState<GateState>(initialState)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function prepareGate() {
      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (assuranceError) {
        setState((current) => ({
          ...current,
          error: 'Two-step verification could not be checked. Try again.',
        }))
        return
      }

      if (assurance.currentLevel === 'aal2') {
        router.replace(nextPath)
        router.refresh()
        return
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors()

      if (factorsError) {
        setState((current) => ({
          ...current,
          error: 'Your authenticator could not be loaded. Try again.',
        }))
        return
      }

      const verifiedFactor = factors.totp.find(
        (factor) => factor.status === 'verified',
      )

      if (verifiedFactor) {
        const { data: challenge, error: challengeError } =
          await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id })

        if (challengeError) {
          setState((current) => ({
            ...current,
            error: 'A verification challenge could not be started. Try again.',
          }))
          return
        }

        setState({
          mode: 'challenge',
          factorId: verifiedFactor.id,
          challengeId: challenge.id,
          qrCode: null,
          secret: null,
          error: null,
        })
        return
      }

      // Supabase keeps an unverified factor when setup is interrupted. It does
      // not contain the original QR secret when listed again, so discard stale
      // attempts before creating a fresh, usable enrollment.
      for (const pendingFactor of factors.all.filter(
        (factor) =>
          factor.factor_type === 'totp' && factor.status === 'unverified',
      )) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: pendingFactor.id,
        })

        if (unenrollError) {
          setState((current) => ({
            ...current,
            error:
              'An unfinished authenticator setup could not be cleared. Sign out, sign in, and try again.',
          }))
          return
        }
      }

      const { data: enrollment, error: enrollmentError } =
        await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Accelerator OS administrator',
        })

      if (enrollmentError) {
        setState((current) => ({
          ...current,
          error:
            'Authenticator setup could not start. Sign out, sign in, and try again.',
        }))
        return
      }

      setState({
        mode: 'enroll',
        factorId: enrollment.id,
        challengeId: null,
        qrCode: enrollment.totp.qr_code,
        secret: enrollment.totp.secret,
        error: null,
      })
    }

    void prepareGate()
  }, [nextPath, router, supabase])

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!state.factorId || code.length !== 6) return

    setSubmitting(true)
    setState((current) => ({ ...current, error: null }))

    let challengeId = state.challengeId

    if (!challengeId) {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: state.factorId })

      if (challengeError) {
        setState((current) => ({
          ...current,
          error: 'The verification could not start. Request a new code.',
        }))
        setSubmitting(false)
        return
      }

      challengeId = challenge.id
      setState((current) => ({ ...current, challengeId }))
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: state.factorId,
      challengeId,
      code,
    })

    if (error) {
      setCode('')
      setState((current) => ({
        ...current,
        error: 'That code was not accepted. Enter the newest six-digit code.',
      }))
      setSubmitting(false)
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  if (state.mode === 'loading' && !state.error) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper-strong)] p-6 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-3 border-[var(--line)] border-t-[var(--signal)] motion-reduce:animate-none" />
        <p className="mt-4 text-sm font-bold text-[var(--ink-muted)]">
          Checking account security…
        </p>
      </div>
    )
  }

  if (state.error && !state.factorId) {
    return (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950">
        <p className="font-black">Verification is temporarily unavailable</p>
        <p className="mt-2 text-sm leading-6">{state.error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 min-h-11 rounded-full bg-red-950 px-5 text-sm font-black text-white transition hover:bg-red-900"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-6">
      {state.mode === 'enroll' ? (
        <div className="grid gap-5 rounded-2xl border border-[var(--line)] bg-white p-5 text-[var(--ink)] sm:grid-cols-[10rem_1fr] sm:items-center">
          {state.qrCode ? (
            <div className="rounded-xl border border-[var(--line)] bg-white p-3">
              {/* Supabase returns a complete SVG data URL that must be rendered
                  directly; Next Image treats the embedded SVG markup as URL
                  query syntax and rejects it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.qrCode}
                alt="Authenticator setup QR code"
                width={160}
                height={160}
                className="mx-auto size-36"
              />
            </div>
          ) : null}
          <div>
            <p className="font-black">1. Scan this code</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
              Use Google Authenticator, Microsoft Authenticator, 1Password, or
              another authenticator app.
            </p>
            {state.secret ? (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-bold">
                  Cannot scan the code?
                </summary>
                <p className="mt-2 rounded-lg bg-stone-100 p-3 font-mono text-xs break-all">
                  {state.secret}
                </p>
              </details>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 text-[var(--ink)]">
          <p className="font-black">Open your authenticator app</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Enter the newest six-digit code shown for Accelerator OS.
          </p>
        </div>
      )}

      <form onSubmit={verify} className="grid gap-4">
        <label className="grid gap-2 text-sm font-bold">
          {state.mode === 'enroll' ? '2. Verify setup' : 'Verification code'}
          <input
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            minLength={6}
            maxLength={6}
            required
            autoFocus={state.mode === 'challenge'}
            disabled={submitting || Boolean(state.error && !state.factorId)}
            placeholder="000000"
            aria-describedby="mfa-status"
            className="min-h-14 rounded-xl border border-[var(--line)] bg-white px-4 text-center font-mono text-2xl tracking-[0.35em] text-[var(--ink)] transition outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15"
          />
        </label>
        <button
          disabled={submitting || code.length !== 6 || !state.factorId}
          type="submit"
          className="min-h-12 rounded-full bg-[var(--ink)] px-5 font-black text-white transition hover:bg-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? 'Verifying…'
            : state.mode === 'enroll'
              ? 'Enable two-step verification'
              : 'Verify and continue'}
        </button>
        <p
          id="mfa-status"
          aria-live="polite"
          className="min-h-6 text-sm leading-6 text-red-800"
        >
          {state.error}
        </p>
      </form>
    </div>
  )
}
