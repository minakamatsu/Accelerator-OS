'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import {
  removeProfilePicture,
  updateProfileSettings,
  type ProfileSettingsState,
} from '@/app/(platform)/settings/actions'
import { UserIcon } from '@/components/icons'

const initialState: ProfileSettingsState = {
  status: 'idle',
  message: null,
}

export function AccountProfileForm({
  avatarHref,
  displayName,
  email,
}: {
  avatarHref: string | null
  displayName: string
  email: string | null
}) {
  const [saveState, saveAction, saving] = useActionState(
    updateProfileSettings,
    initialState,
  )
  const [removeState, removeAction, removing] = useActionState(
    removeProfilePicture,
    initialState,
  )

  return (
    <div className="mt-6 grid gap-6">
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--paper-strong)] text-[var(--ink-muted)]">
          {avatarHref ? (
            <Image
              src={avatarHref}
              alt="Your current profile picture"
              width={64}
              height={64}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <UserIcon className="size-7" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-black">{displayName || 'Your profile'}</p>
          {email ? (
            <p className="mt-1 truncate text-sm text-[var(--ink-muted)]">
              {email}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Your sign-in email does not change with your display name.
          </p>
        </div>
      </div>

      <form action={saveAction} className="grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          Display name
          <input
            name="displayName"
            defaultValue={displayName}
            disabled={saving}
            minLength={2}
            maxLength={80}
            required
            autoComplete="name"
            aria-invalid={Boolean(saveState.errors?.displayName)}
            aria-describedby={
              saveState.errors?.displayName ? 'display-name-error' : undefined
            }
            className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 text-[var(--ink)] transition outline-none focus:border-[var(--brand-bright)] focus:ring-4 focus:ring-[var(--brand-bright)]/15"
          />
          {saveState.errors?.displayName ? (
            <span
              id="display-name-error"
              className="font-normal text-[var(--danger-ink)]"
            >
              {saveState.errors.displayName[0]}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Profile picture
          <input
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={saving}
            aria-invalid={Boolean(saveState.errors?.avatar)}
            aria-describedby={
              saveState.errors?.avatar
                ? 'avatar-guidance avatar-error'
                : 'avatar-guidance'
            }
            className="min-h-12 cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--ink)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--surface-hover)] file:px-4 file:py-2 file:font-bold file:text-[var(--ink)]"
          />
          <span
            id="avatar-guidance"
            className="font-normal text-[var(--ink-muted)]"
          >
            JPG, PNG, or WebP. Maximum 2 MB. The original file stays private.
          </span>
          {saveState.errors?.avatar ? (
            <span
              id="avatar-error"
              className="font-normal text-[var(--danger-ink)]"
            >
              {saveState.errors.avatar[0]}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={saving}
          className="min-h-12 rounded-full bg-[var(--action)] px-5 font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {saving ? 'Saving profile…' : 'Save profile'}
        </button>

        <p
          aria-live="polite"
          className={`min-h-6 text-sm leading-6 ${
            saveState.status === 'success'
              ? 'text-[var(--success-ink)]'
              : 'text-[var(--danger-ink)]'
          }`}
        >
          {saveState.message}
        </p>
      </form>

      {avatarHref ? (
        <form
          action={removeAction}
          className="border-t border-[var(--line)] pt-5"
        >
          <button
            type="submit"
            disabled={removing}
            className="min-h-11 rounded-full border border-[var(--danger-line)] bg-[var(--danger-soft)] px-5 text-sm font-black text-[var(--danger-ink)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {removing ? 'Removing…' : 'Remove profile picture'}
          </button>
          <p
            aria-live="polite"
            className={`mt-3 min-h-6 text-sm leading-6 ${
              removeState.status === 'success'
                ? 'text-[var(--success-ink)]'
                : 'text-[var(--danger-ink)]'
            }`}
          >
            {removeState.message}
          </p>
        </form>
      ) : null}
    </div>
  )
}
